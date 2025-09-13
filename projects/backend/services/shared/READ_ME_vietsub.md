# Tài Liệu Kiến Trúc Shared Services

## Tổng Quan

Tài liệu này mô tả kiến trúc shared services cho Smart Shopping Cart System được phát triển bởi nhóm Advanced Support Squad trong khuôn khổ cuộc thi IoT Challenge 2025 "Edge AI for smart retail" do FPT Software và Silicon Labs phối hợp tổ chức. Lớp shared services cung cấp nền tảng hạ tầng cơ bản cho truy cập cơ sở dữ liệu, business logic và quản lý cấu hình trên tất cả các thành phần hệ thống.

## Thiết Kế Kiến Trúc

Shared services triển khai mô hình kiến trúc phân lớp với sự tách biệt rõ ràng các mối quan tâm và nguyên tắc dependency injection. Kiến trúc bao gồm bốn lớp chính phối hợp với nhau để cung cấp nền tảng hệ thống mạnh mẽ, có khả năng mở rộng và dễ bảo trì.

### Cấu Trúc Lớp

```
API Layer (FastAPI Endpoints)
         ↓
Business Logic Layer (services.py)
         ↓  
Repository Layer (repos.py)
         ↓
Data Access Layer (db.py)
         ↓
Configuration Layer (settings.py)
```

## Các Thành Phần Chính

### Quản Lý Cấu Hình (settings.py)

**Mục đích**: Quản lý cấu hình tập trung với thiết lập dựa trên môi trường và hỗ trợ dependency injection.

**Tính Năng Chính**:
- `DatabaseConfig`: Tham số kết nối cơ sở dữ liệu với hỗ trợ biến môi trường
- `Settings`: Cấu hình toàn ứng dụng sử dụng Pydantic BaseSettings
- Tích hợp biến môi trường cho triển khai Docker
- Xử lý mật khẩu bảo mật với secret value wrapper
- Quản lý instance settings toàn cục

**Tham Số Cấu Hình**:
- Kết nối cơ sở dữ liệu: host, port, user, password, tên database
- Cấu hình dịch vụ API: thiết lập port, kích hoạt cache
- Ép buộc character set: UTF8MB4 cho hỗ trợ quốc tế
- Thiết lập timeout kết nối và độ tin cậy

### Lớp Truy Cập Dữ Liệu (db.py)

**Mục đích**: Quản lý kết nối cơ sở dữ liệu với kiểm soát transaction và xử lý lỗi.

**Tính Năng Chính**:
- `get_conn()`: Context manager cho kết nối cơ sở dữ liệu với quản lý transaction tự động
- `test_connection()`: Xác thực kết nối cơ sở dữ liệu
- `get_database_info()`: Truy xuất thông tin hệ thống
- Tích hợp PyMySQL với ép buộc character set UTF8MB4
- Xử lý tự động commit/rollback transaction
- Quản lý connection pooling và timeout

**Quản Lý Transaction**:
- Tự động commit khi hoạt động thành công
- Tự động rollback khi có exception
- Cleanup kết nối trong finally blocks
- Logging và propagation lỗi
- Ép buộc SQL mode để đảm bảo tính toàn vẹn dữ liệu

### Lớp Repository (repos.py)

**Mục đích**: Trừu tượng hóa truy cập dữ liệu với các hoạt động CRUD và truy vấn domain-specific.

**Các Lớp Repository**:

#### ProductRepo
- Quản lý catalog sản phẩm với các hoạt động CRUD toàn diện
- Chức năng tìm kiếm: theo tên, khu vực, loại
- Quản lý inventory với hỗ trợ độ chính xác decimal
- Hoạt động xác thực và cập nhật stock
- Hỗ trợ cả sản phẩm bán theo đơn vị và theo cân

#### CartRepo
- Quản lý nội dung giỏ hàng với cập nhật inventory thời gian thực
- Nhiều chế độ cập nhật: hoạt động replace, merge, delta
- Hoạt động JOIN để tính giá và chi tiết sản phẩm
- Đồng bộ inventory với điều chỉnh stock tự động
- Hỗ trợ độ chính xác decimal cho giao dịch theo cân

#### CartConfigRepo
- Quản lý cấu hình thiết bị BLE
- Cấu hình endpoint streaming camera
- Quản lý địa chỉ MAC và UUID để nhận dạng phần cứng
- Hoạt động UPSERT cho cập nhật cấu hình

#### MapBeaconRepo
- Cấu hình hệ thống định vị trong nhà
- Quản lý tọa độ beacon và hiệu chuẩn
- Cấu hình cường độ tín hiệu RSSI
- Thiết lập hệ số môi trường cho độ chính xác định vị

#### MapRepo
- Hệ thống ánh xạ không gian dựa trên lưới
- Quản lý hệ thống tọa độ 10x10
- Phân loại khu vực và quản lý vùng
- Hoạt động bulk cho cập nhật dữ liệu bản đồ

### Lớp Business Logic (services.py)

**Mục đích**: Triển khai logic domain với validation, business rules và xử lý lỗi.

**Các Lớp Service**:

#### ProductService
- Quản lý lifecycle sản phẩm với business validation
- Thuật toán tìm kiếm với validation tham số
- Business rules inventory và quản lý stock
- Tạo và cập nhật sản phẩm với ép buộc tính toàn vẹn dữ liệu

#### CartService
- Business logic giỏ hàng với tính toán giảm giá
- Hoạt động cart đa chế độ (replace, merge, delta)
- Tính toán tổng thời gian thực với business rules
- Validation inventory và kiểm tra stock

#### CartConfigService
- Quản lý cấu hình phần cứng
- Validation và quản lý UUID dịch vụ BLE
- Validation endpoint stream camera

#### MapBeaconService
- Quản lý cấu hình hệ thống định vị
- Validation hiệu chuẩn beacon và tọa độ
- Thuật toán tối ưu cường độ tín hiệu

#### MapService
- Quản lý dữ liệu không gian với validation lưới
- Business rules phân loại khu vực
- Hoạt động cập nhật bulk với tính toàn vẹn transaction

## Kiến Trúc Luồng Dữ Liệu

### Luồng Xử Lý Request
1. **API Endpoint** nhận HTTP request
2. **Service Layer** xác thực tham số và áp dụng business rules
3. **Repository Layer** thực thi hoạt động cơ sở dữ liệu
4. **Data Access Layer** quản lý kết nối và transactions
5. **Response** trả dữ liệu đã xử lý về client

### Quản Lý Transaction
- Context managers kết nối đảm bảo cleanup tài nguyên phù hợp
- Ranh giới transaction tự động với xử lý commit/rollback
- Propagation lỗi với logging chi tiết
- Connection pooling để tối ưu hiệu suất

### Chiến Lược Xử Lý Lỗi
- Xử lý exception phân lớp với mã trạng thái HTTP phù hợp
- Khôi phục lỗi cơ sở dữ liệu với logic retry kết nối
- Validation business rule với thông báo lỗi thân thiện người dùng
- Tích hợp logging để debug và monitoring

## Tích Hợp Môi Trường

### Tích Hợp Docker Compose
Shared services tích hợp liền mạch với orchestration Docker Compose:

**Biến Môi Trường**:
- `DB_HOST`: Hostname máy chủ cơ sở dữ liệu
- `DB_PORT`: Port máy chủ cơ sở dữ liệu (mặc định: 3306)
- `DB_USER`: Username cơ sở dữ liệu
- `DB_PASSWORD`: Password cơ sở dữ liệu
- `DB_NAME`: Tên cơ sở dữ liệu
- `API_PORT`: Port dịch vụ API (mặc định: 8136)
- `CACHE_ENABLED`: Flag kích hoạt cache

**Phụ Thuộc Dịch Vụ**:
- Health checks dịch vụ cơ sở dữ liệu
- Validation kết nối mạng
- Volume mounting cho dữ liệu persistent
- Giao thức giao tiếp inter-service

### Triển Khai Production
- Quản lý cấu hình specific môi trường
- Xử lý credential bảo mật
- Thiết lập tối ưu hiệu suất
- Endpoints monitoring và health check

## Tối Ưu Hiệu Suất

### Hiệu Suất Cơ Sở Dữ Liệu
- Connection pooling với thiết lập timeout có thể cấu hình
- Tối ưu truy vấn với chiến lược indexing phù hợp
- Transaction batching cho hoạt động bulk
- Sử dụng prepared statement cho bảo mật và hiệu suất

### Quản Lý Memory
- Mô hình context manager cho cleanup tài nguyên tự động
- Xử lý độ chính xác decimal cho tính toán tài chính
- Serialization dữ liệu hiệu quả cho API responses
- Quản lý lifecycle kết nối

### Cân Nhắc Khả Năng Mở Rộng
- Thiết kế dịch vụ stateless cho horizontal scaling
- Quản lý kết nối cơ sở dữ liệu cho truy cập đồng thời
- Điểm tích hợp chiến lược caching
- Tương thích load balancing

## Triển Khai Bảo Mật

### Bảo Vệ Dữ Liệu
- Ngăn chặn SQL injection thông qua parameterized queries
- Validation đầu vào tại ranh giới service layer
- Bảo mật mật khẩu với secret value wrappers
- Ép buộc character set cho tính toàn vẹn dữ liệu

### Bảo Mật Kết Nối
- Quản lý credential bảo mật thông qua biến môi trường
- Hỗ trợ mã hóa kết nối cơ sở dữ liệu
- Bảo mật network-level thông qua Docker networking
- Kiểm soát truy cập thông qua ranh giới dịch vụ

## Mô Hình Tích Hợp

### Giao Tiếp Service
- Ranh giới dịch vụ rõ ràng với interfaces được định nghĩa tốt
- Dependency injection cho testability và maintainability
- Contracts xử lý lỗi giữa các lớp
- Tính nhất quán transformation dữ liệu trên các services

### Tích Hợp Hệ Thống Bên Ngoài
- Trừu tượng hóa database vendor thông qua PyMySQL
- Quản lý cấu hình cho nhiều môi trường
- Điểm tích hợp monitoring và health check
- Tương thích hạ tầng logging

## Kiến Trúc Triển Khai

Lớp shared services hỗ trợ nhiều kịch bản triển khai:

### Môi Trường Development
- Kết nối cơ sở dữ liệu local
- Cấu hình debug logging
- Tương thích hot reload
- Hỗ trợ khởi tạo test data

### Môi Trường Production
- Container orchestration thông qua Docker Compose
- Cấu hình biến môi trường
- Tích hợp health monitoring
- Hỗ trợ backup và recovery

### Môi Trường Testing
- Tích hợp mock service
- Cô lập test database
- Hỗ trợ automated testing
- Khả năng performance benchmarking

## Đặc Tả Input/Output

### Contracts Giao Diện Service

Lớp shared services cung cấp các giao diện được định nghĩa rõ ràng cho trao đổi dữ liệu giữa các thành phần hệ thống. Tất cả hoạt động tuân theo mô hình nhất quán cho xử lý lỗi, validation dữ liệu và định dạng response.

### Giao Diện Data Access Layer

#### Database Connection Context
**Tham Số Input**:
- Cấu hình kết nối từ biến môi trường
- Yêu cầu transaction isolation
- Đặc tả timeout truy vấn

**Định Dạng Output**:
- Object kết nối PyMySQL với character set UTF8MB4
- Quản lý transaction tự động (commit/rollback)
- Propagation lỗi với logging chi tiết

### Định Dạng Dữ Liệu Repository Layer

#### Hoạt Động Product
**Đặc Tả Input**:
```python
# Tạo/cập nhật sản phẩm
{
    "product_name": "string",
    "product_type": "string", 
    "area": "string",
    "price": "decimal(10,2)",
    "quantity": "decimal(10,3)",
    "weight_kg": "decimal(8,3)"
}
```

**Đặc Tả Output**:
```python
# Response sản phẩm
{
    "product_id": "integer",
    "name": "string",
    "type": "string",
    "area": "string", 
    "price": "decimal",
    "quantity": "decimal",
    "weight_kg": "decimal"
}
```

#### Hoạt Động Cart
**Đặc Tả Input**:
```python
# Cập nhật cart items
{
    "mode": "replace|merge|delta",
    "items": [
        {
            "product_id": "integer",
            "quantity": "decimal(10,3)"
        }
    ]
}
```

**Đặc Tả Output**:
```python
# Response cart với totals
{
    "cart_id": "integer",
    "items": [
        {
            "product_id": "integer",
            "name": "string",
            "quantity": "decimal",
            "price": "decimal",
            "subtotal": "decimal"
        }
    ],
    "total": "decimal",
    "final_total": "decimal",
    "total_items": "integer"
}
```

### Định Dạng Response Service Layer

#### Mô Hình Success Response
```python
{
    "status": "success",
    "data": {},  # Dữ liệu specific service
    "message": "Operation completed successfully"
}
```

#### Mô Hình Error Response
```python
{
    "status": "error",
    "error_code": "string",
    "message": "string",
    "details": {}  # Context lỗi tùy chọn
}
```

### Định Dạng Dữ Liệu Configuration

#### Cấu Hình Database
**Biến Môi Trường**:
- `DB_HOST`: Hostname database (string)
- `DB_PORT`: Port database (integer, mặc định: 3306)
- `DB_USER`: Username database (string)
- `DB_PASSWORD`: Password database (string)
- `DB_NAME`: Tên database (string)

#### Cấu Hình API
**Biến Môi Trường**:
- `API_PORT`: Port dịch vụ API (integer, mặc định: 8136)
- `CACHE_ENABLED`: Kích hoạt cache (boolean, mặc định: false)

### Tiêu Chuẩn Validation Dữ Liệu

#### Yêu Cầu Độ Chính Xác Decimal
- Trường price: DECIMAL(10,2) - hỗ trợ đến 99,999,999.99
- Trường quantity: DECIMAL(10,3) - hỗ trợ số lượng phân số cho sản phẩm bán theo cân
- Trường weight: DECIMAL(8,3) - hỗ trợ đo lường trọng lượng chính xác

#### Yêu Cầu Character Set
- Tất cả trường text: UTF8MB4 encoding cho hỗ trợ ký tự quốc tế
- Database collation: utf8mb4_unicode_ci cho sắp xếp và so sánh phù hợp
- API responses: UTF-8 encoding với headers Content-Type phù hợp

Kiến trúc shared services này cung cấp nền tảng mạnh mẽ cần thiết cho các khả năng IoT và AI tiên tiến của Smart Shopping Cart System trong khi duy trì tiêu chuẩn cao về chất lượng code, hiệu suất và khả năng bảo trì.
