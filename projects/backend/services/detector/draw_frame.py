import cv2

def draw_detections_legacy(frame, detections, labels, min_conf_threshold, bbox_colors):
    """
    frame: BGR np.ndarray
    detections: results[0].boxes  (Ultralytics)
    labels: model.names
    min_conf_threshold: float
    bbox_colors: List[(B,G,R)]
    => Vẽ y như file gốc và trả về frame đã vẽ + object_count
    """
    object_count = 0
    if detections is not None and getattr(detections, "xyxy", None) is not None:
        for xyxy, cls, conf in zip(detections.xyxy, detections.cls, detections.conf):
            xmin, ymin, xmax, ymax = map(int, xyxy.tolist())
            classidx = int(cls.item())
            classname = labels[classidx]
            conf_val = conf.item()

            if conf_val > min_conf_threshold:
                color = bbox_colors[classidx % len(bbox_colors)]
                cv2.rectangle(frame, (xmin, ymin), (xmax, ymax), color, 2)

                label = f'{classname}: {int(conf_val * 100)}%'
                label_size, base_line = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                label_ymin = max(ymin, label_size[1] + 10)
                cv2.rectangle(frame, (xmin, label_ymin - label_size[1] - 10),
                              (xmin + label_size[0], label_ymin + base_line - 10), color, cv2.FILLED)
                cv2.putText(frame, label, (xmin, label_ymin - 7),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
                object_count += 1

    cv2.putText(frame, f'Number of objects: {object_count}', (10, 40),
                cv2.FONT_HERSHEY_SIMPLEX, .7, (0, 255, 255), 2)
    return frame, object_count