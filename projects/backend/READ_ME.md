# =========================================
# READ_ME.MD (ROOT)
# Advanced Support Squad Server — Cấu trúc file & tóm tắt module
# =========================================

# 1) CẤU TRÚC THƯ MỤC / FILE CỦA SERVER (PROJECT TREE)

.
├─ docker-compose.yaml          # Orchestration: db, api, detector (ENV inline, ports, volumes)
├─ 001_schema.sql               # Schema MySQL
├─ 002_insert.sql               # Dữ liệu mẫu
├─ how_to_run.txt               # Hướng dẫn chạy dự án (compose / module lẻ / venv)
├─ lib_requirements             # Tổng hợp libs khi chạy bằng venv "my_env" (không Docker)
├─ services/
│  ├─ api/                      # REST API cho cart & products (FastAPI + MySQL)
│  │  ├─ server.py              # Khởi tạo app + endpoints /healthz, /cart/*, /products/*
│  │  ├─ schemas/
│  │  │  ├─ cart.py             # Pydantic models: body/response cho giỏ hàng (replace/merge/delta)
│  │  │  └─ product.py          # Pydantic models: Product, ProductListItem, ProductDetail, ProductType
│  │  ├─ Dockerfile             # Image python:3.11-slim; uvicorn services.api.server:app
│  │  ├─ requirements.txt       # fastapi, uvicorn[standard], pydantic, PyMySQL, (dotenv optional)
│  │  ├─ api_endpoint.txt       # Tài liệu chi tiết endpoint API (QA/devops dùng nhanh)
│  │  └─ READ_ME.MD             # HDSD riêng của module API (I/O, run, lỗi thường gặp)
│  │
│  ├─ detector/                 # Dịch vụ nhận diện (YOLO + OpenCV, FastAPI)
│  │  ├─ app.py                 # Lifespan start_all_detectors(); expose /healthz /image /inventory
│  │  ├─ object_detect.py       # Luồng detector: đọc stream, YOLO mỗi N khung, encode JPEG
│  │  ├─ draw_frame.py          # Vẽ bbox/nhãn/FPS lên frame
│  │  ├─ state.py               # RAM store: latest_jpeg + inventory (thread-safe)
│  │  ├─ config.py              # CARTS, MODEL_PATH, IMG_SIZE, DETECT_INTERVAL, LABEL_TO_ID, PORT
│  │  ├─ models/                # (optional) model YOLO *.pt nếu không trỏ qua ENV
│  │  ├─ Dockerfile             # Image CPU-only (opencv-headless, ultralytics, torch cpu)
│  │  ├─ requirements.txt       # fastapi, uvicorn, opencv-headless, ultralytics, torch, numpy, pillow
│  │  ├─ api_endpoint.txt       # Tài liệu endpoint detector
│  │  └─ READ_ME.MD             # HDSD riêng của module Detector
│  │
│  └─ shared/                   # Thư viện dùng chung (không có Dockerfile riêng)
│     ├─ db.py                  # Kết nối MySQL (ENV: DB_HOST/PORT/USER/PASSWORD/NAME, utf8mb4)
│     ├─ repos.py               # Repository: product/cart (SQL tham số hoá, JOIN, tổng tiền, 3 mode ghi)
│     └─ READ_ME.MD             # HDSD shared + best practices, checklist
│
└─ storage/
   └─ frames/
      └─ cart_{id}/             # (optional) vòng đệm ảnh 10 khung/giỏ nếu bật lưu tạm

# 2) TÓM TẮT NGẮN GỌN TÍNH NĂNG CHÍNH
# - services/api:
#   * /cart/{id}/items (POST): ghi giỏ theo mode replace/merge/delta
#   * /cart/{id} (GET): trả items đã JOIN tên/giá + tổng tiền
#   * /products... (GET): chi tiết/tìm kiếm/phiên lọc theo loại/khu vực
#   * Cổng mặc định: 8000 -> /docs, /openapi.json, /healthz
#
# - services/detector:
#   * /image?cart_id=...: JPEG khung mới nhất (đã vẽ bbox/nhãn)
#   * /inventory?cart_id=...: JSON số lượng theo nhãn → product_id (map qua LABEL_TO_ID)
#   * Cổng mặc định: 8100; YOLO theo chu kỳ mỗi DETECT_INTERVAL khung; auto-reconnect stream
#
# - services/shared:
#   * Cấp DAL thống nhất: tạo/đóng kết nối, chạy truy vấn an toàn, map lỗi DB về lỗi nghiệp vụ
#   * Được COPY vào image của các service khi build (import dạng services.shared.*)

# 3) LƯU Ý QUAN TRỌNG / BEST PRACTICES
# - ENV: không hardcode secrets; đặt ENV trong docker-compose hoặc venv runtime.
# - DB: dùng utf8mb4; import 001_schema.sql + 002_insert.sql trước khi test.
# - CORS: chỉ bật và whitelist origin cần thiết khi front-end gọi khác origin/port.
# - LAN: mở Firewall TCP 8000 (API), 8100 (Detector) nếu cần truy cập từ máy khác.
# - Detector hiệu năng: giảm IMG_SIZE, tăng DETECT_INTERVAL, dùng model nhẹ.
# - Packaging: đảm bảo __init__.py trong "services", "services/api", "services/detector", "services/shared" để import chuẩn.

# 4) TÀI LIỆU LIÊN QUAN
# - services/api/READ_ME.MD            # Hướng dẫn chi tiết API module
# - services/detector/READ_ME.MD       # Hướng dẫn chi tiết Detector module
# - services/shared/READ_ME.MD         # Hướng dẫn module Shared
# - how_to_run.txt                     # Cách chạy: compose / lẻ / venv / mixed
# - lib_requirements                   # Danh sách libs khi chạy bằng venv "my_env"
