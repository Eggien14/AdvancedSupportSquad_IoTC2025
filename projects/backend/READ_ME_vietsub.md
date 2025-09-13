
# HỆ THỐNG GIỎ HÀNG THÔNG MINH - NỀN TẢNG SERVER
Phiên bản: 2.1 | Ngày cập nhật: 13/09/2025
Đội: Advanced Support Squad | Đơn vị tổ chức: FPT Software & Silicon Labs

---

## 1. CẤU TRÚC THƯ MỤC DỰ ÁN (SERVER)

```
ASS_server/
│
├── .env                  # Biến môi trường cấu hình hệ thống
├── docker-compose.yaml   # Cấu hình Docker Compose (sản xuất)
├── docker-compose.simple.yaml # Cấu hình Docker Compose (phát triển)
├── docker.ps1            # Script quản lý khởi động/dừng dịch vụ
├── how_to_run.txt        # Hướng dẫn triển khai nhanh
├── lib_requirement.txt   # Danh sách thư viện Python yêu cầu
├── server_endpoint.txt   # Danh sách endpoint toàn hệ thống
├── README.md             # Tài liệu hệ thống (tiếng Anh)
├── README_vietsub.md     # Tài liệu hệ thống (tiếng Việt)
│
├── ASS_env/              # Virtual environment Python (không chỉnh sửa thủ công)
│
├── db/                   # Thư mục cơ sở dữ liệu
│   ├── db_init/          # Script khởi tạo schema CSDL (SQL)
│   └── db_insert/        # Script dữ liệu mẫu (SQL)
│
├── logs/                 # Thư mục log hệ thống
│   ├── api/              # Log API service
│   └── detector/         # Log detector service
│
├── models/               # Thư mục lưu trữ mô hình AI (YOLOv8, v.v.)
│
├── nginx/                # Cấu hình reverse proxy Nginx
│   ├── nginx.conf        # File cấu hình chính của Nginx
│   ├── generate-ssl.sh   # Script tạo chứng chỉ SSL tự động
│   └── certs/            # Thư mục chứa chứng chỉ SSL
│
├── services/             # Thư mục mã nguồn các dịch vụ chính
│   ├── api/              # Dịch vụ API (FastAPI)
│   │   ├── server.py         # Entry point API service
│   │   ├── requirements.txt  # Thư viện Python cho API
│   │   ├── api_endpoint.txt  # Danh sách endpoint API
│   │   └── schemas/          # Định nghĩa schema dữ liệu
│   ├── detector/         # Dịch vụ Computer Vision (YOLOv8)
│   │   ├── app.py            # Entry point detector service
│   │   ├── object_detect.py  # Logic nhận diện đối tượng
│   │   ├── config.py         # Cấu hình detector
│   │   └── models/           # Mô hình AI detector
│   └── shared/           # Lớp truy cập dữ liệu & logic chung
│       ├── db.py             # Kết nối và truy vấn CSDL
│       ├── repos.py          # Repository pattern
│       ├── services.py       # Logic nghiệp vụ
│       └── settings.py       # Quản lý cấu hình
│
├── storage/               # Lưu trữ file ảnh, frame detection
│   ├── cam_detect/        # Ảnh chụp từ camera cart
│   └── frames/            # Frame detection lưu tạm
│
└── my_model.pt            # File mô hình AI chính (YOLOv8)
```

**Mô tả nhanh các thành phần chính:**
- `docker-compose.yaml`, `docker-compose.simple.yaml`: Cấu hình khởi tạo toàn bộ hệ thống bằng Docker (sản xuất/phát triển).
- `docker.ps1`: Script PowerShell quản lý vòng đời dịch vụ (start/stop/logs).
- `how_to_run.txt`: Hướng dẫn triển khai nhanh cho người dùng mới.
- `lib_requirement.txt`: Danh sách thư viện Python cần thiết cho toàn hệ thống.
- `server_endpoint.txt`: Tổng hợp endpoint REST/WebSocket của toàn bộ hệ thống.
- `ASS_env/`: Virtual environment Python, không chỉnh sửa thủ công.
- `db/`: Chứa script khởi tạo và dữ liệu mẫu cho MySQL.
- `logs/`: Lưu trữ log hoạt động của các dịch vụ.
- `models/`: Lưu trữ file mô hình AI (YOLOv8, v.v.).
- `nginx/`: Cấu hình reverse proxy, SSL, và các script liên quan.
- `services/`: Mã nguồn các dịch vụ chính (API, detector, shared).
- `storage/`: Lưu trữ file ảnh, frame detection phục vụ computer vision.
- `my_model.pt`: File mô hình AI chính sử dụng cho detector.

---

## Mục Lục

1. Tổng Quan Dự Án
2. Kiến Trúc Hệ Thống
3. Hạ Tầng Cốt Lõi
4. Các Thành Phần Dịch Vụ
5. Kiến Trúc Triển Khai
6. Hướng Dẫn Khởi Động Nhanh
7. Quản Lý Cấu Hình
8. Mạng & Bảo Mật
9. Hiệu Suất & Giám Sát
10. Cấu Trúc Tài Liệu
11. Khắc Phục Sự Cố
12. Quy Trình Phát Triển

---

## 2. Tổng Quan Dự Án

Hệ thống Giỏ Hàng Thông Minh là giải pháp IoT toàn diện cho bán lẻ thông minh, tích hợp computer vision, xử lý dữ liệu thời gian thực và quản lý kho hàng hiện đại. Dự án được phát triển cho cuộc thi IoT Challenge 2025 "Edge AI for smart retail".

Các điểm nổi bật:
- Xử lý Edge AI: Nhận diện đối tượng YOLOv8 tối ưu cho môi trường bán lẻ
- Quản lý giỏ hàng thông minh với nhiều chế độ cập nhật
- Theo dõi kho hàng tự động tích hợp computer vision
- Kiến trúc API mở rộng: 29 REST endpoints, 5 kênh WebSocket
- Giao tiếp thời gian thực qua WebSocket
- Bảo mật doanh nghiệp: SSL/TLS, quản lý chứng chỉ tự động
- Triển khai linh hoạt: Hỗ trợ cả phát triển và sản xuất

Bảng công nghệ sử dụng:
| Lớp | Công Nghệ | Phiên Bản | Mục Đích |
|------|-----------|----------|----------|
| Reverse Proxy | Nginx | Latest | SSL termination, load balancing, bảo mật |
| API Framework | FastAPI | 0.104.1 | Web framework Python async hiệu suất cao |
| Computer Vision | YOLOv8 (Ultralytics) | 8.0.196 | Nhận diện, phân loại đối tượng |
| Cơ Sở Dữ Liệu | MySQL | 8.0 | Lưu trữ dữ liệu ACID, UTF8MB4 |
| Containerization | Docker & Compose | Latest | Điều phối, triển khai dịch vụ |
| Python Runtime | Python | 3.11+ | Môi trường runtime ứng dụng |
| ML Framework | PyTorch | CPU-only | Suy luận mô hình computer vision |

Bối cảnh cuộc thi: Thể hiện khả năng Edge AI cho bán lẻ thông minh, xử lý AI tại edge, kiến trúc microservices mở rộng, tích hợp computer vision với hệ thống bán lẻ truyền thống.

---

## 3. Kiến Trúc Hệ Thống

### Sơ đồ kiến trúc tổng thể

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                          Hệ Thống Giỏ Hàng Thông Minh                        │
│                             Nền Tảng Server                                   │
└───────────────────────────────────────────────────────────────────────────────┘

Lớp truy cập bên ngoài
├── Ứng dụng mobile (iOS/Android)
├── Ứng dụng web (React/Vue.js)
├── Thiết bị IoT cart (ESP32/Raspberry Pi)
└── Tích hợp bên thứ ba (POS, ERP)

Lớp Nginx reverse proxy (gateway sản xuất)
├── SSL/TLS termination (port 8118 HTTPS)
├── HTTP load balancing (port 8136 HTTP)
├── Phục vụ & caching nội dung tĩnh
├── Security headers & bảo vệ DDoS
├── Rate limiting & throttling yêu cầu
└── WebSocket proxy & xử lý upgrade

Lớp dịch vụ ứng dụng (microservices)
├── API service (FastAPI - port nội bộ 8136)
│   ├── Quản lý giỏ hàng (6 endpoints)
│   ├── Thao tác danh mục sản phẩm (8 endpoints)
│   ├── Hệ thống kiểm soát kho hàng (5 endpoints)
│   ├── Quản lý map & beacon (10 endpoints)
│   ├── Phân tích & báo cáo (5 endpoints)
│   ├── Kênh WebSocket thời gian thực (5 streams)
│   └── Giám sát sức khỏe & trạng thái hệ thống
│
├── Detector service (YOLOv8 - port nội bộ 8100)
│   ├── Pipeline xử lý hình ảnh (OpenCV)
│   ├── Nhận diện & phân loại đối tượng
│   ├── Nhận diện & đếm kho hàng
│   ├── Xử lý vision thời gian thực (CPU tối ưu)
│   └── Quản lý mô hình & cấu hình
│
└── Shared services (services/shared)
  ├── Lớp truy cập cơ sở dữ liệu (DAL) - PyMySQL
  ├── Dịch vụ logic nghiệp vụ & xác thực
  ├── Quản lý cấu hình & settings
  ├── Utility functions & helper methods
  └── Giao thức giao tiếp liên dịch vụ

Lớp lưu trữ dữ liệu
├── MySQL database (port ngoài 3308, trong 3306)
│   ├── Danh mục sản phẩm chính (product_master)
│   ├── Kho hàng giỏ hàng (cart_items)
│   ├── Quản lý cấu hình cart (cart_config)
│   ├── Hệ thống định vị beacon (map_beacon)
│   └── Ánh xạ bố cục cửa hàng (map)
├── Hệ thống lưu trữ file
│   ├── Hình ảnh sản phẩm & media assets
│   ├── Detection frames & video streams
│   └── System logs & audit trails
└── Lớp caching (tích hợp Redis tùy chọn)
    ├── 🔄 Quản Lý Trạng Thái Session
    ├── 📊 Caching Dữ Liệu Analytics
    └── 🚀 Tối Ưu Phản Hồi API
```

### Luồng Giao Tiếp Dịch Vụ

```
📱 Luồng Yêu Cầu Client:
┌─────────────┐   HTTPS/WSS    ┌─────────────┐   HTTP/WS     ┌─────────────┐
│   External  │ ─────────────► │    Nginx    │ ────────────► │ API Service │
│   Clients   │                │   Proxy     │               │  (FastAPI)  │
└─────────────┘                └─────────────┘               └──────┬──────┘
                                                                    │
                                                               Shared Layer
                                                                Imports
                                                                    │
🔍 Luồng Computer Vision:                                    ┌──────▼──────┐
┌─────────────┐   Detection    ┌─────────────┐   Results   │  services/  │
│ Image Input │ ─────────────► │  Detector   │ ──────────► │   shared    │
│ (Cameras)   │                │  Service    │             │ (Database)  │
└─────────────┘                │  (YOLOv8)   │             └──────┬──────┘
                               └─────────────┘                    │
                                                             Database
🗄️ Luồng Dữ Liệu:                                         Operations
┌─────────────┐   SQL Queries  ┌─────────────┐                    │
│  Business   │ ─────────────► │  MySQL 8.0  │ ◄──────────────────┘
│   Logic     │                │  Database   │
└─────────────┘                └─────────────┘
```

### Topology Mạng

```
🌍 Internet/LAN
        │
        ▼
🔀 Nginx Proxy (Gateway)
├── HTTP  :8136 ──┐
└── HTTPS :8118 ──┤
                  │
        ┌─────────▼─────────┐
        │  Docker Network   │
        │  (ass_server_*)   │
        ├───────────────────┤
        │ API      :8136    │
        │ Detector :8100    │  
        │ Database :3308    │
        └───────────────────┘
```

---

## 🔧 Hạ Tầng Cốt Lõi

### Kiến Trúc Cơ Sở Dữ Liệu (MySQL 8.0)

#### Thông Số Kỹ Thuật Cấu Hình
- **Engine**: InnoDB với tuân thủ ACID
- **Character Set**: UTF8MB4 với hỗ trợ Unicode collation
- **Authentication**: mysql_native_password để tương thích
- **Port Mapping**: Ngoài 3308 → Trong 3306
- **Performance**: Tối ưu với connection pooling và query caching

#### Tổng Quan Schema Cơ Sở Dữ Liệu
```sql
-- Cấu Trúc Bảng Cốt Lõi
CREATE DATABASE iotc25_advanced_support_squad 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Hệ Thống Quản Lý Sản Phẩm
CREATE TABLE product_master (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(255) NOT NULL,
    product_type VARCHAR(64) NOT NULL,
    area VARCHAR(64),                    -- Khu vực/phần cửa hàng
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 0.000,
    weight_kg DECIMAL(8,3) DEFAULT NULL, -- Trọng lượng sản phẩm
    manufacturer VARCHAR(128),
    expiry_or_mfg_date DATE,
    origin VARCHAR(128),                 -- Xuất xứ
    info1 VARCHAR(255),                  -- Trường thông tin bổ sung 1
    info2 VARCHAR(255),                  -- Trường thông tin bổ sung 2
    detail1 VARCHAR(255),                -- Trường chi tiết 1
    detail2 VARCHAR(255),                -- Trường chi tiết 2
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product_type (product_type),
    INDEX idx_area (area),
    INDEX idx_name (product_name)
);

-- Kho Hàng Giỏ Hàng
CREATE TABLE cart_items (
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 0.000,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (cart_id, product_id),
    FOREIGN KEY (product_id) REFERENCES product_master(product_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_cart_id (cart_id),
    INDEX idx_updated_at (updated_at)
);

-- Cấu Hình & Quản Lý Cart
CREATE TABLE cart_config (
    cart_id INT PRIMARY KEY,
    cart_mac_address VARCHAR(32) UNIQUE,
    cart_position VARCHAR(128),          -- Tọa độ vị trí hiện tại
    cart_state VARCHAR(32),              -- active, inactive, maintenance
    cart_voice_cmd VARCHAR(255),         -- Khả năng lệnh giọng nói
    cart_firmware_update VARCHAR(128),   -- Thông tin phiên bản firmware
    cam_stream_url VARCHAR(255),         -- Endpoint camera stream
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mac_address (cart_mac_address),
    INDEX idx_state (cart_state)
);

-- Hệ Thống Định Vị Bluetooth Beacon
CREATE TABLE map_beacon (
    map_id INT NOT NULL,
    beacon_id VARCHAR(32) NOT NULL,
    beacon_mac_address VARCHAR(32),
    beacon_x_coordinate DECIMAL(10,3),   -- Vị trí X trong lưới cửa hàng
    beacon_y_coordinate DECIMAL(10,3),   -- Vị trí Y trong lưới cửa hàng
    beacon_D0 DECIMAL(6,2),              -- Khoảng cách tham chiếu (mét)
    beacon_n DECIMAL(4,2),               -- Hệ số mất mát đường truyền
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (map_id, beacon_id),
    INDEX idx_coordinates (beacon_x_coordinate, beacon_y_coordinate),
    INDEX idx_mac_address (beacon_mac_address)
);

-- Hệ Thống Lưới Bố Cục Cửa Hàng
CREATE TABLE map (
    map_id INT NOT NULL,
    x_coordinate INT NOT NULL,           -- Tọa độ X lưới
    y_coordinate INT NOT NULL,           -- Tọa độ Y lưới  
    area VARCHAR(64),                    -- Chỉ định khu vực (sữa, điện tử, v.v.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (map_id, x_coordinate, y_coordinate),
    INDEX idx_area (area)
);
```

### Cấu Hình Nginx Reverse Proxy

#### Tính Năng Nginx Cốt Lõi
- **SSL/TLS Termination**: Tạo và gia hạn chứng chỉ tự động
- **Load Balancing**: Phân phối round-robin trên các instance API service
- **Hỗ Trợ WebSocket**: Proxy WebSocket liền mạch với connection upgrade
- **Security Headers**: Chèn security header toàn diện
- **Nội Dung Tĩnh**: Phục vụ file tĩnh hiệu quả với caching
- **Rate Limiting**: Rate limiting yêu cầu có thể cấu hình theo IP

#### Cấu Trúc Cấu Hình Nginx
```nginx
# Cấu Hình HTTP Chính
upstream api_backend {
    server api:8136;
    keepalive 32;
}

upstream detector_backend {
    server detector:8100;
    keepalive 16;
}

# HTTP Server (Port 8136)
server {
    listen 80;
    server_name _;
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    
    # API routes
    location / {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cấu hình timeout
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Hỗ trợ WebSocket
    location /ws/ {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket timeout
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
    
    # Detector service proxy
    location /detector/ {
        proxy_pass http://detector_backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Hỗ trợ upload file lớn
        client_max_body_size 50M;
        proxy_request_buffering off;
    }
}

# HTTPS Server (Port 8118) - Chỉ Sản Xuất
server {
    listen 443 ssl http2;
    server_name _;
    
    # Cấu Hình SSL
    ssl_certificate /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS Security
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Cùng location blocks như HTTP với SSL termination
    location / {
        proxy_pass http://api_backend;
        # ... cùng cấu hình proxy
    }
}
```

---

## 🎛️ Các Thành Phần Dịch Vụ

### API Service (FastAPI) - Giao Diện REST Cốt Lõi

**📍 Vị Trí**: `services/api/`  
**📚 Tài Liệu Đầy Đủ**: `services/api/README.md`  
**🔗 Tham Chiếu Endpoint**: `services/api/api_endpoint.txt`  
**🌐 Tài Liệu Tương Tác**: http://localhost:8136/docs

#### Khả Năng Dịch Vụ
- **29 REST API Endpoints** trên 6 danh mục chức năng
- **Giao Tiếp WebSocket Thời Gian Thực** cho cập nhật cart trực tiếp
- **Quản Lý Cart Nâng Cao** với 3 chế độ cập nhật (replace/merge/delta)
- **Danh Mục Sản Phẩm Toàn Diện** với tìm kiếm và lọc
- **Phân Tích & Báo Cáo** với tính năng business intelligence
- **Giám Sát Sức Khỏe** với báo cáo trạng thái hệ thống chi tiết

#### Tính Năng Kỹ Thuật Chính
- **Kiến Trúc Async/Await**: I/O không chặn cho concurrency cao
- **Xác Thực Dữ Liệu Pydantic**: Xử lý request/response type-safe
- **Tài Liệu API Tự Động**: OpenAPI 3.0 với Swagger UI
- **Hỗ Trợ CORS**: Cross-origin resource sharing có thể cấu hình
- **Xử Lý Lỗi**: Exception handling toàn diện với HTTP status codes đúng

### Detector Service (YOLOv8) - Engine Computer Vision

**📍 Vị Trí**: `services/detector/`  
**📚 Tài Liệu Đầy Đủ**: `services/detector/README.md`  
**🔗 Tham Chiếu Endpoint**: `services/detector/detector_endpoint.txt`  
**🌐 Tài Liệu Tương Tác**: http://localhost:8100/docs

#### Khả Năng Computer Vision
- **Nhận Diện Đối Tượng Thời Gian Thực** sử dụng mạng neural YOLOv8
- **Nhận Diện & Đếm Kho Hàng** cho quản lý stock tự động
- **Xử Lý CPU-tối ưu** với suy luận PyTorch chỉ CPU
- **Hỗ Trợ Đa Định Dạng** cho hình ảnh JPEG, PNG, BMP, WEBP
- **Ngưỡng Confidence Có Thể Cấu Hình** để tinh chỉnh độ chính xác detection

#### Triển Khai Kỹ Thuật
- **Mô Hình**: YOLOv8 được training tùy chỉnh cho nhận diện sản phẩm bán lẻ
- **Hiệu Suất**: ~200-500ms thời gian xử lý mỗi hình ảnh
- **Bộ Nhớ**: Tối ưu cho môi trường bộ nhớ thấp (khuyến nghị 2GB+)
- **Threading**: Quản lý state thread-safe cho yêu cầu đồng thời

### Shared Services Layer - Nền Tảng Truy Cập Dữ Liệu

**📍 Vị Trí**: `services/shared/`  
**📚 Tài Liệu Đầy Đủ**: `services/shared/README.md`

#### Mẫu Kiến Trúc
Lớp shared services triển khai **kiến trúc 4 tầng**:
1. **Lớp Settings** (`settings.py`): Quản lý cấu hình
2. **Lớp Database** (`db.py`): Quản lý kết nối và utilities
3. **Lớp Repository** (`repos.py`): Abstraction truy cập dữ liệu
4. **Lớp Service** (`services.py`): Triển khai logic nghiệp vụ

#### Trách Nhiệm Chính
- **Truy Cập Cơ Sở Dữ Liệu Tập Trung**: Điểm kết nối cơ sở dữ liệu duy nhất
- **Abstraction Logic Nghiệp Vụ**: Quy tắc nghiệp vụ và validation có thể tái sử dụng
- **Quản Lý Cấu Hình**: Xử lý cấu hình dựa trên môi trường
- **Giao Tiếp Liên Dịch Vụ**: Giao thức chia sẻ giữa API và Detector services

---

## 🚀 Kiến Trúc Triển Khai

### Cấu Hình Docker Compose

#### Cấu Hình Sản Xuất (docker-compose.yaml)
```yaml
version: '3.8'

services:
  # Database Service
  db:
    image: mysql:8.0
    container_name: ass_server-db-1
    ports:
      - "3308:3306"
    environment:
      MYSQL_ROOT_PASSWORD: 123456789
      MYSQL_DATABASE: iotc25_advanced_support_squad
      MYSQL_USER: eggien
      MYSQL_PASSWORD: 0363802865
      MYSQL_CHARSET: utf8mb4
      MYSQL_COLLATION: utf8mb4_unicode_ci
    volumes:
      - mysql_data:/var/lib/mysql
      - ./db/db_init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h 127.0.0.1 -u${MYSQL_USER} -p${MYSQL_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s

  # API Service
  api:
    build:
      context: .
      dockerfile: services/api/Dockerfile
    container_name: ass_server-api-1
    environment:
      - DB_HOST=db
      - DB_PORT=3306
      - API_PORT=8136
      - CACHE_ENABLED=true
      - DEBUG=false
    depends_on:
      db:
        condition: service_healthy
    expose:
      - "8136"
    healthcheck:
      test: ["CMD-SHELL", "python -c \"import urllib.request; urllib.request.urlopen('http://localhost:8136/healthz')\""]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 20s

  # Computer Vision Service  
  detector:
    build:
      context: .
      dockerfile: services/detector/Dockerfile
    container_name: ass_server-detector-1
    ports:
      - "8100:8100"
    environment:
      - MODEL_PATH=/app/my_model.pt
      - CONFIDENCE_THRESHOLD=0.5
      - CPU_THREADS=4
    volumes:
      - ./my_model.pt:/app/my_model.pt:ro
    depends_on:
      - db
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8100/healthz || exit 1"]
      interval: 15s
      timeout: 10s
      retries: 5

  # Nginx Reverse Proxy
  nginx-proxy:
    image: nginx:alpine
    container_name: ass_server-nginx-proxy-1
    ports:
      - "8136:80"    # Truy cập HTTP
      - "8118:443"   # Truy cập HTTPS
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/generate-ssl.sh:/etc/nginx/generate-ssl.sh:ro
      - nginx_certs:/etc/nginx/certs
    environment:
      - SERVER_IP=${SERVER_IP:-192.168.1.100}
    depends_on:
      api:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost/nginx-health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mysql_data:
    driver: local
  nginx_certs:
    driver: local

networks:
  default:
    name: ass_server_default
```

#### Cấu Hình Phát Triển (docker-compose.simple.yaml)
- **Thiết Lập Đơn Giản**: Không có nginx proxy, truy cập API trực tiếp
- **Khởi Động Nhanh Hơn**: Giảm khoảng thời gian health check
- **Tính Năng Phát Triển**: Bật debug mode, hỗ trợ hot reload
- **Port Mapping**: Truy cập trực tiếp API (8136) và Detector (8100)

### Script Quản Lý (docker.ps1)

#### Lệnh Có Sẵn
```powershell
# Triển khai sản xuất với đầy đủ tính năng
.\docker.ps1 full
# - Nginx proxy với SSL/TLS
# - Hỗ trợ HTTPS trên port 8118
# - Security headers sản xuất
# - Tạo chứng chỉ tự động

# Triển khai phát triển (khởi động nhanh hơn)
.\docker.ps1 simple  
# - Truy cập API trực tiếp trên port 8136
# - Không có SSL/nginx overhead
# - Lý tưởng cho phát triển và testing

# Quản lý dịch vụ
.\docker.ps1 down      # Dừng tất cả dịch vụ một cách graceful
.\docker.ps1 restart   # Khởi động lại cấu hình hiện tại
.\docker.ps1 logs      # Xem logs tổng hợp
.\docker.ps1 status    # Hiển thị trạng thái sức khỏe container
```

---

## ⚡ Hướng Dẫn Khởi Động Nhanh

### Xác Minh Yêu Cầu Tiên Quyết
```bash
# Kiểm tra cài đặt Docker
docker --version          # Yêu cầu: 20.10+
docker-compose --version  # Yêu cầu: 2.0+

# Xác minh tài nguyên có sẵn
docker system info | grep -E "CPUs|Total Memory"

# Kiểm tra port có sẵn
netstat -an | grep -E ":(8136|8118|8100|3308)"  # Nên trống
```

### Thiết Lập Môi Trường
1. **Cấu Hình Network IP** trong file `.env`:
   ```bash
   # Chỉnh sửa file .env với địa chỉ IP thực tế của bạn
   SERVER_IP=192.168.1.100  # Thay thế bằng IP của bạn
   ```

2. **Xác Minh File Model** tồn tại:
   ```bash
   ls -la my_model.pt  # File mô hình YOLOv8 (yêu cầu cho detector)
   ```

### Các Bước Triển Khai

#### Tùy Chọn 1: Script Tự Động (Khuyến Nghị)
```bash
# Điều hướng đến thư mục dự án
cd ASS_server

# Khởi động môi trường phát triển
.\docker.ps1 simple
# Chờ thông báo "SIMPLE Services started successfully!"

# HOẶC khởi động môi trường sản xuất  
.\docker.ps1 full
# Chờ thông báo "FULL Services started successfully!"

# Xác minh triển khai
curl http://localhost:8136/healthz
curl http://localhost:8100/healthz
```

#### Tùy Chọn 2: Docker Compose Thủ Công
```bash
# Triển khai phát triển
docker-compose -f docker-compose.simple.yaml up -d --build

# Triển khai sản xuất
docker-compose up -d --build

# Giám sát tiến trình khởi động
docker-compose logs -f
```

### Điểm Truy Cập Sau Triển Khai
- **Tài Liệu API**: http://localhost:8136/docs (Swagger UI)
- **Tài Liệu API Thay Thế**: http://localhost:8136/redoc (ReDoc)
- **Tài Liệu Computer Vision**: http://localhost:8100/docs
- **HTTPS Sản Xuất**: https://localhost:8118/docs (chỉ triển khai full)
- **Health Checks**: 
  - API: http://localhost:8136/healthz
  - Detector: http://localhost:8100/healthz

---

## ⚙️ Quản Lý Cấu Hình

### Biến Môi Trường (.env)
```bash
# Cấu Hình Mạng (Quan Trọng cho SSL)
SERVER_IP=192.168.1.100           # Địa chỉ IP mạng thực tế của bạn

# Cấu Hình Cơ Sở Dữ Liệu  
DB_HOST=db                        # Tên dịch vụ Docker
DB_PORT=3306                      # Port MySQL nội bộ
DB_USER=eggien                    # Username cơ sở dữ liệu
DB_PASSWORD=0363802865            # Password cơ sở dữ liệu
DB_NAME=iotc25_advanced_support_squad

# Cấu Hình API Service
API_PORT=8136                     # Port dịch vụ API
CACHE_ENABLED=true                # Bật response caching
DEBUG=false                       # Debug mode (chỉ phát triển)

# Tinh Chỉnh Hiệu Suất
UVICORN_WORKERS=1                 # API worker processes
MAX_CONNECTIONS=100               # Kết nối cơ sở dữ liệu tối đa
CONNECTION_TIMEOUT=30             # Timeout kết nối cơ sở dữ liệu

# Cấu Hình Computer Vision
MODEL_PATH=/app/my_model.pt       # Đường dẫn file mô hình YOLOv8
CONFIDENCE_THRESHOLD=0.5          # Ngưỡng confidence detection
CPU_THREADS=4                     # CPU threads cho inference
```

### Quản Lý Chứng Chỉ SSL
- **Tạo Tự Động**: Chứng chỉ tự động tạo dựa trên SERVER_IP
- **Chứng chỉ Self-signed**: Phù hợp cho phát triển và testing
- **Chứng chỉ Sản Xuất**: Thay thế chứng chỉ tự tạo bằng chứng chỉ CA-signed
- **Vị Trí Chứng Chỉ**: Thư mục `nginx/certs/`
- **Gia Hạn**: Khởi động lại nginx-proxy service để tạo lại chứng chỉ

---

## 🔒 Mạng & Bảo Mật

### Kiến Trúc Bảo Mật
- **Mã Hóa SSL/TLS**: Mã hóa end-to-end cho tất cả traffic HTTPS
- **Security Headers**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- **Xác Thực Input**: Xác thực request toàn diện dựa trên Pydantic
- **Ngăn Chặn SQL Injection**: Queries có tham số và bảo vệ ORM
- **Cấu Hình CORS**: Chính sách cross-origin có thể cấu hình
- **Rate Limiting**: Request throttling dựa trên Nginx

### Cô Lập Mạng
```
🌍 Public Internet
        │
        ▼
🔀 Nginx Proxy (DMZ)
        │
        ▼  
🔒 Docker Network (Internal)
├── API Service      (Không có external ports)
├── Detector Service (Không có external ports)
└── Database         (Không có external ports)
```

### Bảo Mật Cơ Sở Dữ Liệu
- **Cô Lập User**: User cơ sở dữ liệu chuyên dụng với quyền tối thiểu
- **Mã Hóa Kết Nối**: Xác thực MySQL native password
- **Bảo Mật Backup**: Backup tự động với xác minh tính toàn vẹn dữ liệu
- **Kiểm Soát Truy Cập**: Hạn chế truy cập cấp mạng qua Docker networks

---

## 📊 Hiệu Suất & Giám Sát

### Metrics Hiệu Suất Hệ Thống
- **Thời Gian Phản Hồi API**: Mục tiêu <100ms cho operations tiêu chuẩn
- **Xử Lý Computer Vision**: 200-500ms mỗi hình ảnh tùy theo kích thước
- **Hiệu Suất Query Cơ Sở Dữ Liệu**: Tối ưu với indexes và connection pooling
- **Sử Dụng Memory**: ~2-3GB tổng cho tất cả services
- **Sử Dụng CPU**: Tối ưu cho hệ thống multi-core (khuyến nghị 4+ cores)

### Giám Sát Sức Khỏe
```bash
# Kiểm tra sức khỏe hệ thống
curl http://localhost:8136/healthz

# Sức khỏe dịch vụ cụ thể
docker-compose ps                    # Trạng thái container
docker stats                        # Sử dụng tài nguyên
docker-compose logs --tail 50 api   # Logs dịch vụ
```

### Tối Ưu Hiệu Suất
- **Database Connection Pooling**: Quản lý vòng đời kết nối
- **API Response Caching**: Caching tương thích Redis tùy chọn
- **Tối Ưu Xử Lý Hình Ảnh**: Pipeline suy luận PyTorch CPU-tối ưu
- **Nginx Caching**: Caching và nén nội dung tĩnh

---

## 📚 Cấu Trúc Tài Liệu

### Tài Liệu Cấp Dịch Vụ
| Dịch Vụ | README Chính | Tham Chiếu Endpoint | Tài Liệu Trực Tiếp |
|---------|-------------|-------------------|-------------------|
| **API Service** | `services/api/README.md` | `services/api/api_endpoint.txt` | http://localhost:8136/docs |
| **Detector Service** | `services/detector/README.md` | `services/detector/detector_endpoint.txt` | http://localhost:8100/docs |
| **Shared Services** | `services/shared/README.md` | - | - |

### Tài Liệu Cấp Hệ Thống  
| Tài Liệu | Mục Đích | Nội Dung |
|----------|---------|---------|
| **`how_to_run.txt`** | Hướng Dẫn Triển Khai | 6 phương pháp triển khai với hướng dẫn chi tiết |
| **`lib_requirement.txt`** | Tham Chiếu Dependency | Phân tích thư viện hoàn chỉnh và hướng dẫn cài đặt |
| **`server_endpoint.txt`** | Bản Đồ API Hoàn Chỉnh | Tất cả 37 endpoints trên tất cả services |

### Tài Nguyên Bổ Sung
- **Database Schema**: Thư mục `db/db_init/` chứa file schema hoàn chỉnh
- **Dữ Liệu Mẫu**: Thư mục `db/db_insert/` chứa dữ liệu mẫu để testing
- **Cấu Hình Nginx**: Thư mục `nginx/` chứa cấu hình proxy
- **Cấu Hình Docker**: Nhiều file docker-compose cho môi trường khác nhau

---

## 🔧 Khắc Phục Sự Cố

### Vấn Đề Thường Gặp & Giải Pháp

#### Xung Đột Port
```bash
# Kiểm tra sử dụng port
netstat -an | findstr ":8136"
netstat -an | findstr ":8118"  
netstat -an | findstr ":8100"
netstat -an | findstr ":3308"

# Kill processes xung đột
npx kill-port 8136 8118 8100 3308  # Node.js tool
# HOẶC tìm và kill processes thủ công
```

#### Vấn Đề Kết Nối Cơ Sở Dữ Liệu
```bash
# Test kết nối cơ sở dữ liệu
docker exec ass_server-db-1 mysqladmin ping -u eggien -p0363802865

# Kiểm tra logs cơ sở dữ liệu
docker logs ass_server-db-1 --tail 50

# Reset cơ sở dữ liệu hoàn toàn
.\docker.ps1 down
docker volume rm ass_server_mysql_data
.\docker.ps1 simple  # Khởi động lại với cơ sở dữ liệu mới
```

#### Vấn Đề Chứng Chỉ SSL
```bash
# Tạo lại chứng chỉ SSL
docker-compose restart nginx-proxy

# Kiểm tra tính hợp lệ chứng chỉ
docker exec ass_server-nginx-proxy-1 \
  openssl x509 -in /etc/nginx/certs/cert.pem -text -noout

# Tạo chứng chỉ thủ công
docker exec ass_server-nginx-proxy-1 /etc/nginx/generate-ssl.sh
```

#### Vấn Đề Hiệu Suất
```bash
# Giám sát sử dụng tài nguyên
docker stats

# Kiểm tra sức khỏe dịch vụ
curl http://localhost:8136/healthz
curl http://localhost:8100/healthz

# Xem logs chi tiết
docker-compose logs -f --tail 100
```

---

## 💻 Quy Trình Phát Triển

### Thiết Lập Phát Triển Local
```bash
# Clone và thiết lập
git clone <repository-url>
cd ASS_server

# Cấu hình môi trường
cp .env.example .env
# Chỉnh sửa .env với địa chỉ IP của bạn

# Khởi động môi trường phát triển
.\docker.ps1 simple

# Xác minh dịch vụ
curl http://localhost:8136/healthz  # Sức khỏe API
curl http://localhost:8100/healthz  # Sức khỏe Detector
```

### Công Cụ Phát Triển
- **Testing API**: Sử dụng `http://localhost:8136/docs` cho testing tương tác
- **Truy Cập Cơ Sở Dữ Liệu**: Kết nối MySQL trực tiếp trên port 3308
- **Giám Sát Log**: Xem log thời gian thực với `docker-compose logs -f`
- **Hot Reload**: API service hỗ trợ hot reload code trong development mode

### Chiến Lược Testing
```bash
# Testing endpoint API
curl -X GET "http://localhost:8136/products" \
  -H "accept: application/json"

# Testing computer vision  
curl -X POST "http://localhost:8100/api/v1/image" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_image.jpg"

# Testing cơ sở dữ liệu
docker exec -it ass_server-db-1 mysql -u eggien -p0363802865 \
  iotc25_advanced_support_squad -e "SELECT COUNT(*) FROM product_master;"
```

---

**Cập Nhật Cuối**: 13 tháng 9, 2025  
**Phiên Bản**: 2.1 - Tài liệu kiến trúc hoàn chỉnh  
**Đội**: Advanced Support Squad  
**Cuộc Thi**: IoT Challenge 2025 "Edge AI for smart retail"  
**Tổ Chức**: FPT Software & Silicon Labs  

Để có thông tin chi tiết về dịch vụ cụ thể, vui lòng tham khảo tài liệu dịch vụ riêng lẻ trong thư mục tương ứng.
