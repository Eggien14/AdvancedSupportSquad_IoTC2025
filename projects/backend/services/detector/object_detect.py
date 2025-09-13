import time
from collections import deque
from typing import Dict, List, Tuple, Optional

import cv2
import numpy as np
from ultralytics import YOLO
import torch

from . import config
from . import state
from .draw_frame import draw_detections_legacy

# ÉP CPU (giữ y nguyên yêu cầu)
torch.cuda.is_available = lambda: False

# Reconnect settings
NO_FRAME_TIMEOUT_SEC = 3.0
BACKOFF_START = 0.5       # giây
BACKOFF_MAX = 5.0         # giây

class ObjectDetector:
    """
    Refactor nhẹ nhàng: giữ nguyên thông số & logic detect/vẽ như file cũ.
    - Sau mỗi khung: encode JPG và cập nhật RAM để /image trả về.
    - Mỗi chu kỳ detect (7 khung): cập nhật inventory để /inventory trả về.
    - Tự reconnect camera với backoff lũy tiến khi lỗi.
    """
    def __init__(
        self,
        cart_id: int,
        cam_source: str,
        model_path: str,
        image_size: Tuple[int, int] = (480, 480),
        detect_interval: int = 7,
        min_conf_threshold: float = 0.7,
        bbox_colors: List[Tuple[int,int,int]] = None,
        label_to_id: Dict[str,int] = None,
    ):
        self.cart_id = cart_id
        self.cam_source = cam_source
        self.model_path = model_path

        self.detect_interval = detect_interval
        self.imgW, self.imgH = image_size
        self.min_conf_threshold = min_conf_threshold

        # FPS / frame_count
        self.frame_count = 0
        self.frame_rate_calcs = deque([], maxlen=100)
        self.frame_rate_avg = 0.0

        # Colors & mapping
        self.bbox_colors = bbox_colors or config.BBOX_COLORS
        self.label_to_id = label_to_id or config.LABEL_TO_ID

        # Model & labels
        self.model = YOLO(self.model_path, task='detect')
        self.labels = self.model.names

        # Last detections (để vẽ giữa các chu kỳ detect)
        self.last_detections = None

    def _open_capture(self) -> Optional[cv2.VideoCapture]:
        cap = cv2.VideoCapture(self.cam_source)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # giảm độ trễ cho HTTP stream
        return cap if cap.isOpened() else None

    def start(self):
        print(f"[cart {self.cart_id}] start detection from {self.cam_source}")
        cap: Optional[cv2.VideoCapture] = None
        last_frame_ok_ts = time.monotonic()
        backoff = BACKOFF_START

        while True:
            # (Re)open khi chưa có cap hoặc cap đóng
            if cap is None or not cap.isOpened():
                cap = self._open_capture()
                if cap is None:
                    print(f"[cart {self.cart_id}] open failed. retry in {backoff:.1f}s")
                    time.sleep(backoff)
                    backoff = min(backoff * 2, BACKOFF_MAX)
                    continue
                # mở thành công -> reset backoff
                backoff = BACKOFF_START
                last_frame_ok_ts = time.monotonic()

            t_start = time.perf_counter()
            ok, frame = cap.read()

            # Nếu không đọc được frame hoặc quá lâu không có frame -> reconnect
            now = time.monotonic()
            if not ok or frame is None or (now - last_frame_ok_ts) > NO_FRAME_TIMEOUT_SEC:
                print(f"[cart {self.cart_id}] frame error/timeout. reconnect in {backoff:.1f}s")
                try:
                    cap.release()
                except Exception:
                    pass
                cap = None
                time.sleep(backoff)
                backoff = min(backoff * 2, BACKOFF_MAX)
                continue

            # có frame OK
            last_frame_ok_ts = now

            # Resize GIỮ đúng thứ tự (W,H)
            frame = cv2.resize(frame, (self.imgW, self.imgH))
            self.frame_count += 1

            # Chạy YOLO theo chu kỳ detect_interval (GIỮ 7)
            if self.frame_count % self.detect_interval == 0:
                results = self.model(frame, verbose=False)
                self.last_detections = results[0].boxes
                self.frame_count = 0

                # Đếm object theo class name, map sang product_id (GIỮ)
                object_counter: Dict[str, int] = {}
                if self.last_detections is not None and self.last_detections.xyxy is not None:
                    for xyxy, cls, conf in zip(self.last_detections.xyxy,
                                               self.last_detections.cls,
                                               self.last_detections.conf):
                        classidx = int(cls.item())
                        classname = self.labels[classidx]
                        conf_val = conf.item()
                        if conf_val > self.min_conf_threshold:
                            object_counter[classname] = object_counter.get(classname, 0) + 1

                id_quantity: Dict[int, int] = {}
                for label, qty in object_counter.items():
                    if label in self.label_to_id:
                        id_quantity[self.label_to_id[label]] = qty

                # Cập nhật inventory cho API /inventory
                items = [{"product_id": pid, "quantity": qty} for pid, qty in sorted(id_quantity.items())]
                state.set_inventory(self.cart_id, items)

            # VẼ bbox/số lượng (GIỮ logic) lên frame hiện tại
            frame_drawn, _ = draw_detections_legacy(
                frame, self.last_detections, self.labels, self.min_conf_threshold, self.bbox_colors
            )
            
            
            
            # Overlay FPS (giữ kiểu cũ)
            fps = self._update_fps(t_start)
            cv2.putText(frame_drawn, f'FPS: {fps:0.2f}', (10, 20),
                        cv2.FONT_HERSHEY_SIMPLEX, .7, (0, 255, 255), 2)
            
            # ENCODE JPG mỗi 3 frames để giảm lag (thay vì mỗi frame)
            if self.frame_count % 1 == 0:
                # Resize nhỏ hơn cho stream để giảm encoding time
                stream_frame = cv2.resize(frame_drawn, (320, 240))
                ok_jpg, jpg = cv2.imencode(".jpg", stream_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
                if ok_jpg:
                    state.set_latest_jpeg(self.cart_id, jpg.tobytes())

            # nhẹ nhàng
            time.sleep(0.02)

    def _update_fps(self, t_start: float) -> float:
        t_stop = time.perf_counter()
        t_total = t_stop - t_start
        self.frame_rate_calcs.appendleft(1 / t_total if t_total > 0 else 0)
        self.frame_rate_avg = float(np.mean(self.frame_rate_calcs)) if self.frame_rate_calcs else 0.0
        return self.frame_rate_avg


def start_all_detectors():
    """
    Khởi chạy 1 detector thread cho mỗi cart trong config.
    Nếu chỉ có 1 cart → chỉ 1 thread chạy.
    """
    import threading
    threads = []
    for it in config.CARTS:
        det = ObjectDetector(
            cart_id=int(it["cart_id"]),
            cam_source=str(it["source"]),
            model_path=config.MODEL_PATH,
            image_size=config.IMG_SIZE,
            detect_interval=config.DETECT_INTERVAL,
            min_conf_threshold=config.MIN_CONF_THRESHOLD,
            bbox_colors=config.BBOX_COLORS,
            label_to_id=config.LABEL_TO_ID
        )
        t = threading.Thread(target=det.start, daemon=True)
        t.start()
        threads.append(t)
    return threads