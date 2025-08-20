# =========================================
# services/api/READ_ME.MD
# Cart & Product API (FastAPI + MySQL)
# =========================================

# 1) MỤC TIÊU & CHỨC NĂNG
# - Cung cấp REST API cho:
#   + Giỏ hàng (cart): ghi/đọc trạng thái items theo cart_id với 3 chế độ (replace | merge | delta).
#   + Sản phẩm (products): xem chi tiết, tìm theo tên, liệt kê theo khu vực/loại.
# - I/O:
#   + Request: HTTP/JSON
#   + Response: JSON (mã lỗi HTTP chuẩn)
#   + Healthcheck: GET /healthz -> {"status":"ok"}
# - DB: MySQL 8; truy cập qua lớp "shared":
#   + services/shared/db.py      : kết nối MySQL (đọc ENV)
#   + services/shared/repos.py   : truy vấn CRUD + JOIN phục vụ endpoints

# 2) CẤU TRÚC THƯ MỤC CON CỦA API
services/
└─ api/
   ├─ server.py          # Khởi tạo FastAPI + định nghĩa endpoints
   ├─ schemas/
   │  ├─ cart.py         # Kiểu dữ liệu request/response cho giỏ hàng
   │  └─ product.py      # Kiểu dữ liệu sản phẩm (Product, ProductListItem, ProductDetail, ProductType)
   ├─ Dockerfile         # Image cho service API
   ├─ requirements.txt   # Thư viện Python cần thiết cho API
   └─ api_endpoint.txt   # Mô tả chi tiết endpoint (file đi kèm README này)

# 3) ENDPOINTS CHÍNH (tóm tắt)
# - GET  /healthz
# - POST /cart/{cart_id}/items        (body: replace|merge|delta)
# - GET  /cart/{cart_id}              (trả items đã JOIN tên/giá + total)
# - GET  /products/{product_id}       (chi tiết đầy đủ)
# - GET  /products?name=...&limit=... (tìm theo tên: id, name, price)
# - GET  /products/by-area?area=...   (id, name, price, type, area)
# - GET  /products/by-type/{p_type}   (id, name, price, type, area)

# 4) MÔ HÌNH DỮ LIỆU (rút gọn theo schemas)
# - Product (list cơ bản): {product_id:int, name:str, price:decimal}
# - ProductListItem      : {product_id, name, price, type:enum, area:str?}
# - ProductDetail        : Product + {type, area, manufacturer, expiry_or_mfg_date, origin, info1, info2, detail1, detail2}
# - CartResponse         : {cart_id:int, items:[{product_id, name, quantity, price, subtotal}], total:decimal}
# - Upsert body:
#     replace|merge -> {"mode":"replace|merge","items":[{"product_id":1,"quantity":2},...]}
#     delta        -> {"mode":"delta","changes":[{"product_id":1,"delta":-1},...]}

# 5) ENV BIẾN QUAN TRỌNG (đọc trong shared/db.py)
# - DB_HOST (mặc định "db" khi chạy cùng docker compose)
# - DB_PORT (mặc định "3306")
# - DB_USER
# - DB_PASSWORD
# - DB_NAME  (ví dụ: iotc25_advanced_support_squad)
# Gợi ý thêm (tuỳ bạn dùng): UVICORN_WORKERS=2

# 6) GIẢI THÍCH DOCKERFILE (services/api/Dockerfile)
# - Base: python:3.11-slim
# - Cài deps: pip install -r services/api/requirements.txt (tách layer để cache build)
# - Copy code: services/api + services/shared (API phụ thuộc shared)
# - Tạo __init__.py cho các package "services", "services/api", "services/shared" để import kiểu services.api.*
# - EXPOSE 8000; CMD chạy Uvicorn: uvicorn services.api.server:app --host 0.0.0.0 --port 8000
# - Không hardcode secrets vào image; truyền qua ENV / compose.

# 7) GIẢI THÍCH requirements.txt (API)
# - fastapi                 # framework
# - uvicorn[standard]       # ASGI server
# - pydantic                # schemas
# - PyMySQL                 # MySQL driver
# - (tuỳ chọn) python-dotenv # nếu muốn nạp .env khi dev local
# Gợi ý pin: fastapi~=0.112, uvicorn[standard]~=0.30, pydantic~=2.8, PyMySQL~=1.1

# 8) CÁCH CHẠY "CHUYÊN NGHIỆP" (Ưu tiên Docker Compose)
# A. Docker Compose (khuyến nghị)
#    1) Thêm service "api" (build từ services/api/Dockerfile), depends_on: [db]
#    2) Map port: "8000:8000"; Truyền ENV DB_* cho container API
#    3) docker compose up -d --build api
#    4) Kiểm tra: curl http://localhost:8000/healthz   |  mở http://localhost:8000/docs
#
# B. Docker build & run riêng (khi DB đã chạy sẵn)
#    docker build -f services/api/Dockerfile -t ass-api .
#    docker run --rm -p 8000:8000 \
#      -e DB_HOST=<ip_or_service> -e DB_PORT=3306 \
#      -e DB_USER=<user> -e DB_PASSWORD=<pass> -e DB_NAME=<db> \
#      ass-api
#
# C. Chạy local (dev, không Docker)
#    python -m venv .venv && . .venv/bin/activate  # (Windows: .venv\Scripts\activate)
#    pip install -r services/api/requirements.txt
#    set DB_HOST=127.0.0.1  # (PowerShell: $env:DB_HOST="127.0.0.1")
#    uvicorn services.api.server:app --reload --port 8000
#
# D. Khởi tạo DB (nếu dùng file SQL):
#    - Import 001_schema.sql và 002_insert.sql vào MySQL (hoặc mount vào /docker-entrypoint-initdb.d khi chạy container db).
#
# E. Truy cập từ LAN:
#    - Lấy IP máy chạy API (vd 192.168.x.y), mở Firewall cổng 8000 (TCP)
#    - Gọi từ máy khác: http://192.168.x.y:8000/...

# 9) LỖI THƯỜNG GẶP (QUICK FIX)
# - 400 Bad Request: cart_id < 1; mode không hợp lệ; FK lỗi (product_id không tồn tại)
# - 404 Not Found     : sản phẩm không tồn tại
# - DB connect error  : sai ENV hoặc service name "db", quyền user
# - Không truy cập LAN: sai IP (dùng 127.0.0.1 là loopback), firewall chặn, chưa publish 8000
# - CORS (nếu gọi từ web khác origin): bật middleware CORS trong server.py (dev/test), hạn chế origin khi production.

# 10) TÀI LIỆU NỘI BỘ
# - Swagger UI: /docs
# - OpenAPI JSON: /openapi.json
