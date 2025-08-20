# =========================================
# services/detector/READ_ME.MD
# Detector Service (FastAPI + Ultralytics YOLO + OpenCV-headless, CPU-only)
# =========================================

# 1) MỤC TIÊU & CHỨC NĂNG
# - Khởi chạy các luồng (thread) "detector" đọc stream camera cho từng cart.
# - Chạy YOLO theo chu kỳ (mặc định mỗi 7 khung) để đếm vật thể -> ánh xạ sang product_id.
# - Vẽ bbox + nhãn + FPS lên khung hình, ENCODE JPEG và lưu **RAM** (không ghi file) để trả qua API.
# - Cập nhật "inventory" (danh sách {product_id, quantity}) theo từng cart trong **RAM** để API trả JSON.
# - Cung cấp 3 endpoint:
#   + GET /healthz      : kiểm tra sống/chết dịch vụ.
#   + GET /image        : trả JPEG mới nhất của cart (Cache-Control: no-store).
#   + GET /inventory    : trả JSON items theo cart (kèm thời điểm cập nhật).
# - I/O:
#   + Input: HTTP/MJPEG/RTSP camera stream (qua OpenCV VideoCapture).
#   + Output: HTTP/JSON & image/jpeg.

# 2) CẤU TRÚC THƯ MỤC CON (đề xuất, tương ứng các file có sẵn)
services/
└─ detector/
   ├─ app.py            # FastAPI app, dùng lifespan để start_all_detectors() khi khởi động
   ├─ object_detect.py  # Lớp ObjectDetector + start_all_detectors(); YOLO + reconnect camera + encode JPEG
   ├─ draw_frame.py     # Hàm vẽ bbox/nhãn/số lượng & overlay text (FPS, object count)
   ├─ state.py          # Bộ nhớ RAM thread-safe: latest_jpeg theo cart + inventory JSON
   ├─ config.py         # Tham số vận hành & danh sách CARTS (cart_id, source), ngưỡng conf, kích thước ảnh...
   ├─ models/
   │  └─ my_model.pt    # (tùy chọn) model YOLO, nếu không dùng ENV để trỏ model
   ├─ Dockerfile        # Image CPU-only, chuẩn bị OpenCV-headless, torch (CPU), ultralytics
   ├─ requirements.txt  # Thư viện Python cần thiết cho detector
   └─ api_endpoint.txt  # Mô tả chi tiết endpoint

# 3) LUỒNG HOẠT ĐỘNG (TÓM TẮT)
# - app.py:
#     * lifespan startup -> start_all_detectors() khởi tạo 1 thread/1 cart (đọc từ config.CARTS).
# - object_detect.py:
#     * Mỗi thread: mở camera (reconnect backoff khi lỗi), resize về IMG_SIZE, mỗi DETECT_INTERVAL khung gọi YOLO.
#     * Kết quả:
#         - Cập nhật state.set_inventory(cart_id, items).
#         - Vẽ bbox lên frame hiện tại, encode JPEG -> state.set_latest_jpeg(cart_id, jpg_bytes).
# - state.py:
#     * Lưu trữ an toàn theo cart: latest_jpeg & inventory (updated_at ISO-UTC).
# - config.py:
#     * PORT=8100, MODEL_PATH (ENV override), IMG_SIZE, MIN_CONF_THRESHOLD, DETECT_INTERVAL,
#       CARTS=[{cart_id, source}], BBOX_COLORS, LABEL_TO_ID (map nhãn YOLO -> product_id).
# - Endpoint:
#     * /image?cart_id=... đọc từ RAM -> image/jpeg.
#     * /inventory?cart_id=... -> {cart_id, updated_at, items: [{product_id, quantity}]}.

# 4) ĐẦU VÀO/RA (FORMAT)
# - /image:
#     * Query: cart_id (int, bắt buộc)
#     * 200 -> image/jpeg (Cache-Control: no-store)
#     * 404 -> chưa có frame
# - /inventory:
#     * Query: cart_id (int, bắt buộc)
#     * 200 -> {"cart_id":142,"updated_at":"<ISO-UTC>|null","items":[{"product_id":6,"quantity":1},...]}
# - /healthz:
#     * 200 -> {"status":"ok"}

# 5) ENV & CẤU HÌNH (đọc trong config.py)
# - MODEL_PATH        : đường dẫn model YOLO (ưu tiên ENV, fallback: ./models/my_model.pt)
# - PORT              : 8100 (port Uvicorn)
# - IMG_SIZE          : (480,480) theo thứ tự (W,H)
# - MIN_CONF_THRESHOLD: 0.6
# - DETECT_INTERVAL   : 7 (phát hiện mỗi 7 khung)
# - CARTS             : danh sách {"cart_id":142,"source":"http://<ip_cam>/stream"} ...
# - LABEL_TO_ID       : {"Calculator":1,"Stapler":6,...} dùng để map nhãn YOLO -> product_id của hệ thống

# 6) DOCKERFILE (giải thích)
# - Base: python:3.11-slim
# - Cài OS deps tối thiểu: libgl1, libglib2.0-0, libgomp1 (cho OpenCV-headless & Torch CPU).
# - Cài torch (CPU-only) từ index của PyTorch; verify "CUDA disabled".
# - Cài các lib còn lại từ requirements.txt.
# - Copy code services/detector/ -> /app/services/detector/
# - Tạo __init__.py cho "services" & "services/detector" để import theo gói.
# - EXPOSE 8100; CMD chạy: uvicorn services.detector.app:app --host 0.0.0.0 --port 8100
# - Không hardcode secret; dùng ENV (ví dụ MODEL_PATH) hoặc bind mount model vào container.

# 7) REQUIREMENTS.TXT (giải thích)
# - fastapi                 # API server
# - uvicorn[standard]       # ASGI server
# - opencv-python-headless  # Xử lý ảnh (không GUI)
# - ultralytics             # YOLO
# - torch (CPU)             # đã cài riêng trong Dockerfile (index CPU-only)
# - numpy                   # toán tử mảng
# - (tuỳ chọn) pillow       # tiện ích ảnh
# - (tuỳ chọn) python-dotenv# nếu muốn nạp .env khi dev local
# Gợi ý pin: fastapi~=0.112, uvicorn[standard]~=0.30, ultralytics~=8.3, opencv-python-headless~=4.10, numpy~=1.26

# 8) CÁCH CHẠY (ƯU TIÊN DOCKER COMPOSE)
# A. Docker Compose (khuyến nghị)
#    - Thêm service "detector":
#        build:
#          context: .
#          dockerfile: services/detector/Dockerfile
#        environment:
#          - MODEL_PATH=/app/services/detector/models/my_model.pt   # hoặc mount model từ host
#        ports:
#          - "8100:8100"
#        volumes:
#          # (tuỳ chọn) bind mount models/: ./services/detector/models:/app/services/detector/models:ro
#    - Khởi chạy: docker compose up -d --build detector
#    - Kiểm tra:
#        curl http://localhost:8100/healthz
#        curl -I "http://localhost:8100/image?cart_id=142"
#        curl "http://localhost:8100/inventory?cart_id=142"
#
# B. Docker build & run (khi không dùng compose)
#    docker build -f services/detector/Dockerfile -t ass-detector .
#    docker run --rm -p 8100:8100 \
#      -e MODEL_PATH=/app/services/detector/models/my_model.pt \
#      ass-detector
#
# C. Chạy local (dev, không Docker)
#    python -m venv .venv && . .venv/bin/activate      # (Windows: .venv\Scripts\activate)
#    pip install -r services/detector/requirements.txt
#    set MODEL_PATH=services/detector/models/my_model.pt  # (PowerShell: $env:MODEL_PATH="...")
#    uvicorn services.detector.app:app --reload --port 8100
#
# D. Truy cập từ LAN:
#    - Lấy IP máy chạy detector (vd 192.168.x.y), mở firewall TCP/8100.
#    - Máy khác gọi:
#        http://192.168.x.y:8100/image?cart_id=142
#        http://192.168.x.y:8100/inventory?cart_id=142

# 9) LỖI THƯỜNG GẶP & KHẮC PHỤC NHANH
# - Ultralytics cảnh báo "user config dir not writeable":
#     * Có thể bỏ qua khi chạy container; hoặc đặt YOLO_CONFIG_DIR=/tmp
# - Không đọc được frame / timeout:
#     * Kiểm tra URL stream & mạng; detector auto-reconnect (backoff 0.5→5s).
# - /image trả 404:
#     * Chưa nhận được khung hình đầu tiên; kiểm tra camera hoặc quyền truy cập.
# - FPS thấp:
#     * Giảm IMG_SIZE, tăng DETECT_INTERVAL, hoặc dùng model nhẹ hơn.
# - Sai ánh xạ product:
#     * Cập nhật LABEL_TO_ID trong config.py để khớp danh mục hàng hóa.

# 10) TÀI LIỆU NỘI BỘ
# - /docs (không bật mặc định nếu không cấu hình); endpoints dùng đơn giản qua cURL như phần api_endpoint.txt.