# Dịch Vụ API - Hệ Thống Xe Mua Sắm Thông Minh

## Tổng Quan

Dịch Vụ API là cổng REST API trung tâm của Hệ Thống Xe Mua Sắm Thông Minh, được thiết kế cho IoT Challenge 2025 "Edge AI cho bán lẻ thông minh". Dịch vụ này cung cấp các endpoint toàn diện cho quản lý sản phẩm, vận hành xe mua sắm, lập bản đồ không gian, và truyền dữ liệu thời gian thực.

**Đội**: Advanced Support Squad  
**Tổ chức bởi**: FPT Software & Silicon Labs  
**Công nghệ**: FastAPI, MySQL, WebSocket, Docker

## Kiến Trúc

### Kiến Trúc Dịch Vụ
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Ứng Dụng Client│────│   Dịch Vụ API    │────│   Lớp Chia Sẻ   │
│                 │    │   (FastAPI)      │    │  (Cơ Sở Dữ Liệu)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                       ┌──────────────────┐
                       │ Dịch Vụ Detector │
                       │    (YOLOv8)      │
                       └──────────────────┘
```

### Cấu Trúc Lớp
- **Lớp API**: Endpoints FastAPI với schemas Pydantic
- **Lớp Service**: Triển khai logic nghiệp vụ
- **Lớp Repository**: Patterns truy cập cơ sở dữ liệu
- **Lớp Chia Sẻ**: Tiện ích chung và kết nối cơ sở dữ liệu

## Cấu Hình

### Biến Môi Trường
```bash
DB_HOST=db                                    # Host cơ sở dữ liệu
DB_PORT=3306                                  # Port cơ sở dữ liệu
DB_USER=eggien                               # User cơ sở dữ liệu
DB_PASSWORD=0363802865                       # Password cơ sở dữ liệu
DB_NAME=iotc25_advanced_support_squad        # Tên cơ sở dữ liệu
API_PORT=8136                                # Port dịch vụ API
CACHE_ENABLED=true                           # Bật cache
UVICORN_WORKERS=2                            # Số worker Uvicorn
```

### Cấu Hình Docker
- **Port**: 8136 (HTTP API)
- **Base Image**: python:3.11-slim
- **Triển khai**: Docker Compose với nginx proxy (production) hoặc truy cập trực tiếp (simple)

## Endpoints API

### Kiểm Tra Sức Khỏe
- `GET /healthz` - Trạng thái sức khỏe dịch vụ

### Quản Lý Sản Phẩm
- `GET /products/list-all-product` - Liệt kê tất cả sản phẩm (chỉ ID + tên)
- `GET /products` - Tìm kiếm sản phẩm với bộ lọc
- `GET /products/{product_id}` - Lấy thông tin chi tiết sản phẩm
- `GET /products/by-area/{area}` - Lấy sản phẩm theo khu vực
- `GET /products/by-type/{product_type}` - Lấy sản phẩm theo loại
- `POST /products/update-product/{product_id}` - Cập nhật chi tiết sản phẩm
- `POST /products/delete-product/{product_id}` - Xóa sản phẩm

### Quản Lý Kho Xe Mua Sắm
- `POST /cart_inventory/{cart_id}/items` - Cập nhật items trong xe (chế độ replace/merge/delta)
- `GET /cart_inventory/{cart_id}` - Lấy chi tiết xe với tính tổng

### Cấu Hình Xe Mua Sắm
- `GET /cart_infor/list-all-cart` - Liệt kê tất cả cấu hình xe
- `GET /cart_infor/{cart_id}` - Lấy cấu hình xe cụ thể
- `POST /cart_infor/{cart_id}` - Cập nhật cấu hình xe
- `POST /cart_infor/delete-cart/{cart_id}` - Xóa cấu hình xe

### Quản Lý Map Beacon
- `GET /map_beacon/{map_id}` - Lấy tất cả beacon cho một map
- `GET /map_beacon/{map_id}/{beacon_id}` - Lấy cấu hình beacon cụ thể
- `POST /map_beacon/{map_id}/{beacon_id}` - Cập nhật cấu hình beacon
- `POST /map_beacon/delete-beacon/{map_id}/{beacon_id}` - Xóa beacon
- `POST /map_beacon/delete-map/{map_id}` - Xóa tất cả beacon cho map

### Quản Lý Bản Đồ
- `GET /map/{map_id}` - Lấy tất cả ô cho một bản đồ
- `GET /map/{map_id}/{x_coor}/{y_coor}` - Lấy ô bản đồ cụ thể
- `POST /map/{map_id}/{x_coor}/{y_coor}` - Cập nhật ô bản đồ
- `POST /map/delete-map/{map_id}` - Xóa toàn bộ bản đồ
- `POST /map/map-upload/{map_id}` - Cập nhật hàng loạt ô bản đồ

### Streaming Thời Gian Thực
- `WebSocket /ws/cart_inventory/{cart_id}` - Cập nhật kho xe thời gian thực
- `WebSocket /ws/product-detect/{cart_id}` - Stream phát hiện sản phẩm thời gian thực
- `GET /stream` - Endpoint HTTP streaming

## Mô Hình Dữ Liệu

### Schemas Sản Phẩm
- **Product**: Thông tin sản phẩm cơ bản (ID, tên, giá, số lượng, trọng lượng)
- **ProductDetail**: Chi tiết sản phẩm đầy đủ với metadata
- **ProductListItem**: View danh sách sản phẩm với khu vực và loại
- **ProductSimple**: Thông tin sản phẩm tối thiểu (ID + tên)
- **ProductUpdate**: Schema cho việc chỉnh sửa sản phẩm

### Schemas Kho Xe Mua Sắm
- **CartUpsert**: Union type hỗ trợ ba chế độ cập nhật:
  - **Replace**: Thay thế hoàn toàn xe mua sắm
  - **Merge**: Cập nhật một phần xe với số lượng tuyệt đối
  - **Delta**: Thay đổi gia tăng (thêm/bớt items)
- **CartResponse**: Chi tiết xe với tổng tính toán
- **CartItem**: Item xe riêng lẻ với chi tiết sản phẩm

### Schemas Cấu Hình
- **CartConfigRequest/Response**: Quản lý cấu hình xe
- **MapBeaconRequest/Response**: Dữ liệu định vị beacon
- **MapRequest/Response**: Phân bổ khu vực ô bản đồ

## Logic Nghiệp Vụ

### Chế Độ Cập Nhật Xe

1. **Chế Độ Replace**
   ```json
   {
     "mode": "replace",
     "items": [
       {"product_id": 1, "quantity": 2.5},
       {"product_id": 2, "quantity": 1.0}
     ]
   }
   ```

2. **Chế Độ Merge**
   ```json
   {
     "mode": "merge", 
     "items": [
       {"product_id": 1, "quantity": 3.0}
     ]
   }
   ```

3. **Chế Độ Delta**
   ```json
   {
     "mode": "delta",
     "changes": [
       {"product_id": 1, "delta": 1.0},
       {"product_id": 2, "delta": -0.5}
     ]
   }
   ```

### Tính Năng Tìm Kiếm Sản Phẩm
- **Theo Tên**: Tìm kiếm văn bản mờ với patterns LIKE
- **Theo Khu Vực**: Lọc sản phẩm theo khu vực/phần của cửa hàng
- **Theo Loại**: Lọc sản phẩm theo danh mục/loại
- **Phân Trang**: Giới hạn kết quả có thể cấu hình

### Hệ Thống Bản Đồ
- **Dựa Trên Lưới**: Hệ tọa độ X/Y cho layout cửa hàng
- **Tích Hợp Beacon**: Định vị beacon BLE cho theo dõi xe
- **Phân Bổ Khu Vực**: Ô bản đồ được phân bổ cho các khu vực cửa hàng
- **Thao Tác Hàng Loạt**: Cập nhật hiệu quả hàng loạt cho cấu hình bản đồ

## Tính Năng Thời Gian Thực

### WebSocket Streams
- **Stream Kho Xe**: Cập nhật xe trực tiếp khi items thay đổi
- **Stream Phát Hiện Sản Phẩm**: Phát hiện đối tượng thời gian thực từ camera xe
- **Phát Hiện Thay Đổi**: Streaming được tối ưu sử dụng phát hiện thay đổi dựa trên chữ ký

### HTTP Streaming
- **MJPEG Stream**: Video stream từ camera xe
- **Độ Trễ Thấp**: Tối ưu cho giám sát thời gian thực

## Phụ Thuộc

### Phụ Thuộc Cốt Lõi
```
fastapi==0.116.1          # Web framework
uvicorn==0.35.0           # ASGI server
pydantic==2.11.7          # Validation dữ liệu
pydantic-settings==2.6.1  # Quản lý settings
pymysql==1.1.1            # MySQL connector
requests==2.31.0          # HTTP client
websockets==12.0          # Hỗ trợ WebSocket
```

### Phụ Thuộc Lớp Chia Sẻ
- Quản lý kết nối cơ sở dữ liệu
- Logic nghiệp vụ lớp service
- Triển khai pattern repository
- Quản lý settings và cấu hình

## Phát Triển

### Phát Triển Local
```bash
# Cài đặt dependencies
pip install -r requirements.txt

# Chạy development server
uvicorn services.api.server:app --reload --host 0.0.0.0 --port 8136
```

### Phát Triển Docker
```bash
# Setup phát triển đơn giản
docker-compose -f docker-compose.simple.yaml up --build

# Setup production với nginx
docker-compose up --build
```

### Testing API
```bash
# Kiểm tra sức khỏe
curl http://localhost:8136/healthz

# Liệt kê sản phẩm
curl http://localhost:8136/products/list-all-product

# Lấy chi tiết xe
curl http://localhost:8136/cart_inventory/1
```

## Tích Hợp

### Với Dịch Vụ Detector
- **Kết Quả Phát Hiện**: Nhận dữ liệu phát hiện đối tượng từ dịch vụ YOLOv8
- **Cập Nhật Thời Gian Thực**: WebSocket streams cho feeds phát hiện trực tiếp
- **Đồng Bộ Xe**: Cập nhật kho tự động từ phát hiện camera

### Với Cơ Sở Dữ Liệu
- **Connection Pool**: Kết nối cơ sở dữ liệu được quản lý qua lớp chia sẻ
- **Hỗ Trợ Transaction**: Thao tác atomic cho cập nhật xe
- **Tính Toàn Vẹn Dữ Liệu**: Ràng buộc khóa ngoại và validation

### Với Frontend
- **CORS Bật**: Hỗ trợ cross-origin requests
- **REST API**: Phương thức HTTP và status codes chuẩn
- **Hỗ Trợ WebSocket**: Streaming dữ liệu thời gian thực cho web clients

## Giám Sát

### Health Checks
- **Endpoint**: `/healthz` trả về trạng thái dịch vụ
- **Cơ Sở Dữ Liệu**: Validation sức khỏe kết nối
- **Dependencies**: Tính khả dụng dịch vụ chia sẻ

### Xử Lý Lỗi
- **HTTP Status Codes**: Responses lỗi REST API chuẩn
- **Lỗi Validation**: Messages validation Pydantic chi tiết
- **Lỗi Cơ Sở Dữ Liệu**: Xử lý graceful các vấn đề kết nối

## Bảo Mật

### Validation Dữ Liệu
- **Pydantic Models**: Validation đầu vào nghiêm ngặt và kiểm tra type
- **Ngăn SQL Injection**: Queries tham số hóa qua PyMySQL
- **Sanitization Đầu Vào**: Tự động làm sạch và validation dữ liệu

### Cấu Hình CORS
- **Origins**: Origins được phép có thể cấu hình
- **Methods**: Tất cả phương thức HTTP được hỗ trợ
- **Headers**: Cấu hình header linh hoạt cho phát triển

## Hiệu Suất

### Tính Năng Tối Ưu
- **Connection Pooling**: Quản lý kết nối cơ sở dữ liệu hiệu quả
- **Caching**: Lớp cache tùy chọn cho dữ liệu được truy cập thường xuyên
- **Xử Lý Async**: Thao tác I/O không chặn
- **Worker Scaling**: Nhiều worker Uvicorn cho concurrent requests

### Tối Ưu WebSocket
- **Phát Hiện Thay Đổi**: Phát hiện thay đổi dựa trên chữ ký để giảm thiểu transfer dữ liệu
- **Serialization Hiệu Quả**: Tối ưu JSON serialization cho streams thời gian thực
- **Quản Lý Connection**: Tự động reconnection và xử lý lỗi

## Triển Khai

### Cấu Hình Production
- **Nginx Proxy**: SSL termination và load balancing
- **Health Checks**: Giám sát sức khỏe Docker
- **Auto-restart**: Khả năng phục hồi dịch vụ với restart policies
- **Logging**: Structured logging cho giám sát và debugging

### Cân Nhắc Scaling
- **Horizontal Scaling**: Nhiều instance API phía sau nginx
- **Tối Ưu Cơ Sở Dữ Liệu**: Connection pooling và tối ưu query
- **WebSocket Scaling**: Cân nhắc Redis cho hỗ trợ WebSocket multi-instance

---

**Phiên Bản Documentation**: 1.0.0  
**Cập Nhật Lần Cuối**: 13 tháng 9, 2025  
**Duy trì bởi**: Advanced Support Squad
