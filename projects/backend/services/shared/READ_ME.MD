# =========================================
# services/shared/READ_ME.MD
# Shared module (thư viện dùng chung cho các service)
# =========================================

# 1) MỤC TIÊU & PHẠM VI
# - Cung cấp lớp truy cập dữ liệu (Database Access Layer) thống nhất cho toàn hệ thống.
# - Ẩn chi tiết MySQL đằng sau các "repository" để services (api/detector/...) không đụng SQL trực tiếp.
# - Đảm bảo:
#   + Kết nối/đóng DB an toàn theo mỗi request/tác vụ.
#   + Giao diện trả về kiểu dữ liệu nhất quán (dict/list các trường đã chuẩn hoá).
#   + Xử lý lỗi/rollback và ánh xạ lỗi DB về nhóm lỗi ứng dụng.

# 2) THÀNH PHẦN CHÍNH (CẤU TRÚC)
services/
└─ shared/
   ├─ db.py        # Quản lý kết nối MySQL (đọc ENV), helper chạy truy vấn, commit/rollback.
   ├─ repos.py     # Các "repository" thao tác dữ liệu (nhóm Sản phẩm, Giỏ hàng, ...).
   └─ __init__.py  # BẮT BUỘC có để import dạng gói: services.shared.*

# 3) CÁCH CÁC SERVICE SỬ DỤNG "shared"
# - Import theo namespace gói: services.shared.db ; services.shared.repos  (không dùng đường dẫn tương đối).
# - Service API: chỉ gọi hàm trong repos.py (không tự viết SQL trong API).
# - Service Detector: KHÔNG phụ thuộc shared (trừ khi cần đọc cấu hình DB); mặc định detector độc lập.
# - Khi build Docker cho từng service, nhớ COPY cả thư mục "services/shared" vào image (không có Dockerfile riêng).

# 4) ENV BIẾN KẾT NỐI DB (đọc trong shared/db.py)
# - DB_HOST          : hostname (ví dụ "db" khi chạy docker compose)
# - DB_PORT          : 3306
# - DB_USER          : user ứng dụng (quyền tối thiểu: SELECT/INSERT/UPDATE/DELETE)
# - DB_PASSWORD      : mật khẩu
# - DB_NAME          : tên database (ví dụ iotc25_advanced_support_squad)
# - Tuỳ chọn:
#   + DB_CONN_TIMEOUT: 5  (giây)
#   + DB_CHARSET     : utf8mb4
#   + DB_AUTOCOMMIT  : 1  (autocommit, vẫn rollback khi lỗi nếu mở transaction thủ công)
# - Khai báo ENV trong docker-compose của từng service để shared dùng chung.

# 5) NHÓM CHỨC NĂNG TRONG repos.py (MÔ TẢ CẤP CAO)
# - PRODUCT REPOSITORY:
#   + Đọc chi tiết sản phẩm theo product_id.
#   + Tìm theo tên (LIKE), phân trang giới hạn.
#   + Liệt kê theo loại (enum) hoặc theo khu vực (area).
# - CART REPOSITORY:
#   + Đọc giỏ hàng (JOIN tên/giá) và tính tổng tiền.
#   + Ghi trạng thái giỏ theo 3 chế độ: replace / merge / delta (bảo toàn ràng buộc, không để quantity âm).
# - NGUYÊN TẮC:
#   + Truy vấn dùng tham số hoá (parameterized) để chống SQL injection.
#   + Tên cột trả về đã chuẩn hoá (snake_case), số học tiền tệ dùng DECIMAL trong DB.
#   + Tất cả hàm repo không raise lỗi DB thô ra ngoài: map về lỗi nghiệp vụ/giá trị trả về None khi “không có dữ liệu”.

# 6) QUY ƯỚC GIAO DIỆN DỮ LIỆU (OUTPUT CHUẨN HOÁ)
# - Product (rút gọn)     : {product_id:int, name:str, price:number}
# - Product (đầy đủ)      : {product_id, name, price, type, area, manufacturer, expiry_or_mfg_date, origin, info1, info2, detail1, detail2}
# - Cart (đọc)            : {cart_id:int, items:[{product_id, name, quantity, price, subtotal}], total:number}
# - Ghi giỏ (kết quả)     : {ok:bool, mode:"replace|merge|delta", items_count:int}

# 7) QUY TRÌNH KẾT NỐI VÀ GIAO DỊCH (db.py)
# - Khởi tạo kết nối mới theo mỗi request/tác vụ để tránh “connection bleed”.
# - Thực thi truy vấn qua helper trong db.py (đảm bảo đóng cursor/kết nối đúng cách).
# - Commit khi thành công; rollback khi lỗi (Integrity/ForeignKey/...).
# - Ping/keepalive: tự động thử lại 1 lần khi gặp lỗi “server has gone away” (tuỳ cấu hình).

# 8) MIGRATION & DỮ LIỆU MẪU
# - Schema: 001_schema.sql
# - Seed  : 002_insert.sql
# - Cách nạp (một trong các cách):
#   A) Chạy MySQL trong docker compose và mount 2 file vào /docker-entrypoint-initdb.d/
#   B) Dùng client:  mysql -h 127.0.0.1 -P <port> -u <user> -p < DB_NAME  < 001_schema.sql
#                    mysql -h 127.0.0.1 -P <port> -u <user> -p < DB_NAME  < 002_insert.sql

# 9) TÍCH HỢP VỚI DOCKER (KHÔNG CÓ DOCKERFILE RIÊNG)
# - Mỗi service (api, …) khi build image phải:
#   + COPY services/shared  vào /app/services/shared bên trong image.
#   + Đảm bảo tồn tại __init__.py trong "services" và "services/shared".
#   + Thiết lập PYTHONPATH mặc định cho “/app” (base image python:3.11-slim đã phù hợp nếu WORKDIR=/app).
# - Trong docker-compose, truyền ENV DB_* cho từng service sử dụng shared.

# 10) BẢO MẬT & VẬN HÀNH
# - Tài khoản DB theo nguyên tắc "ít quyền nhất".
# - Không check-in mật khẩu vào repo; chỉ truyền qua ENV/secret.
# - Bật charset utf8mb4 để tránh lỗi tiếng Việt/emoji.
# - Log mức tối thiểu ở repo (không log thông tin nhạy cảm); log truy vấn chỉ khi debug.
# - Giới hạn timeout kết nối/truy vấn để tránh treo worker.

# 11) KIỂM THỬ & XÁC NHẬN
# - Dùng DB riêng cho test (schema giống hệt), nạp dữ liệu seed tối thiểu.
# - Kiểm thử hồi quy cho các case:
#   + Đọc sản phẩm không tồn tại -> trả None/404 ở tầng API.
#   + Ghi giỏ "delta" âm vượt quá số lượng -> quantity tối thiểu 0 (hoặc lỗi nghiệp vụ tuỳ chính sách).
#   + Vi phạm FK (product_id không tồn tại) -> rollback, báo lỗi hợp lệ ở tầng API.
# - Quan sát: số kết nối DB, thời gian truy vấn, và plan (EXPLAIN) cho các truy vấn nặng.

# 12) CHECKLIST THÊM MỚI MỘT "REPOSITORY FUNCTION"
# - [ ] Xác định rõ input/output (dict rõ trường, kiểu dữ liệu).
# - [ ] Viết truy vấn tham số hoá, có LIMIT/ORDER BY nếu cần phân trang.
# - [ ] Kiểm soát transaction (commit/rollback); không để connection rò rỉ.
# - [ ] Bảo toàn ràng buộc (FK/UNIQUE) và map lỗi về dạng thống nhất.
# - [ ] Cập nhật tài liệu này (mục 5/6) nếu có thay đổi model dữ liệu.
# - [ ] Viết test case: luồng thành công + luồng lỗi + biên (empty/null/giá trị lớn).

# 13) SỰ CỐ PHỔ BIẾN & CÁCH XỬ LÝ
# - ModuleNotFoundError: No module named 'shared'
#   + Thiếu __init__.py trong services/ hoặc services/shared/.
#   + Container không COPY thư mục shared/ vào image.
#   + PYTHONPATH không trỏ tới WORKDIR chứa "services".
# - ER_NO_DB_ERROR / Access denied:
#   + Sai DB_NAME/USER/PASSWORD hoặc user chưa có quyền trên DB đó.
# - Character set lỗi tiếng Việt:
#   + Đặt DB_CHARSET=utf8mb4; MySQL collation khuyến nghị utf8mb4_unicode_ci.
# - Deadlock/Lock wait timeout:
#   + Rà soát transaction/INDEX; tách truy vấn ghi lớn thành nhiều batch nhỏ.

# 14) TƯƠNG THÍCH & PHỤ THUỘC
# - Trình điều khiển: PyMySQL (khai báo trong requirements.txt của service sử dụng).
# - MySQL 8.x (khuyến nghị); vẫn hoạt động với 5.7 nếu schema không dùng tính năng riêng của 8.x.
# - Không ràng buộc vào web framework cụ thể (FastAPI/Flask đều gọi được).

# 15) TÀI LIỆU THAM CHIẾU NỘI BỘ
# - Sơ đồ DB: xem 001_schema.sql
# - Dữ liệu mẫu: 002_insert.sql
# - Service tiêu thụ shared: services/api (xem READ_ME.MD của API để biết endpoints sử dụng repos).
