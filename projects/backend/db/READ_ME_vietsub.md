# Tài Liệu Schema Cơ Sở Dữ Liệu

## Tổng Quan

Tài liệu này mô tả schema cơ sở dữ liệu cho Smart Shopping Cart System được phát triển bởi nhóm Advanced Support Squad trong khuôn khổ cuộc thi IoT Challenge 2025 "Edge AI for smart retail" do FPT Software và Silicon Labs phối hợp tổ chức. Cơ sở dữ liệu triển khai giải pháp quản lý sản phẩm và theo dõi xe đẩy toàn diện được thiết kế cho môi trường bán lẻ hỗ trợ IoT.

## Cấu Hình Cơ Sở Dữ Liệu

- **Database Engine**: MySQL 8.0
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci
- **Default Authentication**: mysql_native_password
- **Tên Database**: `iotc25_advanced_support_squad`

## Kiến Trúc Schema

Cơ sở dữ liệu gồm năm bảng chính được tổ chức để hỗ trợ chức năng xe đẩy thông minh, quản lý tồn kho sản phẩm và hệ thống định vị không gian.

### Các Bảng Chính

#### product_master
Kho lưu trữ thông tin sản phẩm chính chứa dữ liệu sản phẩm toàn diện.

**Mục đích**: Catalog sản phẩm tập trung hỗ trợ cả bán theo đơn vị và bán theo cân.

**Các Trường Chính**:
- `product_id`: Khóa chính tự tăng
- `product_name`: Chuỗi định danh sản phẩm
- `product_type`: Phân loại danh mục sản phẩm
- `area`: Định danh vị trí lưu trữ
- `price`: Giá sản phẩm định dạng decimal
- `quantity`: Tồn kho khả dụng (hỗ trợ độ chính xác decimal cho sản phẩm bán theo cân)
- `weight_kg`: Thông số trọng lượng sản phẩm (0.000 = bán theo đơn vị, >0 = bán theo cân)
- `manufacturer`: Thông tin nhà sản xuất
- `expiry_or_mfg_date`: Trường ngày để theo dõi hạn sử dụng hoặc ngày sản xuất
- `origin`: Quốc gia hoặc vùng xuất xứ sản phẩm

#### cart_items
Bảng liên kết kết nối các instance giỏ hàng với inventory sản phẩm.

**Mục đích**: Theo dõi nội dung giỏ hàng thời gian thực với quản lý số lượng.

**Các Trường Chính**:
- `cart_id`: Định danh giỏ hàng (BIGINT cho khả năng mở rộng)
- `product_id`: Khóa ngoại tham chiếu đến product_master
- `quantity`: Số lượng sản phẩm trong giỏ (độ chính xác decimal cho sản phẩm bán theo cân)

**Ràng buộc**: 
- Khóa chính tổng hợp (cart_id, product_id)
- Ràng buộc khóa ngoại với CASCADE update và RESTRICT delete

#### cart_config
Cấu hình phần cứng xe đẩy và tham số kết nối.

**Mục đích**: Cấu hình giao tiếp BLE và streaming camera cho từng xe đẩy riêng lẻ.

**Các Trường Chính**:
- `cart_id`: Định danh xe đẩy chính
- `cart_mac_address`: Địa chỉ MAC vật lý để nhận dạng xe đẩy
- `cart_position`: BLE UUID cho dịch vụ theo dõi vị trí
- `cart_state`: BLE UUID cho quản lý trạng thái xe đẩy
- `cart_voice_cmd`: BLE UUID cho chức năng lệnh giọng nói
- `cart_firmware_update`: BLE UUID cho dịch vụ cập nhật firmware
- `cam_stream_url`: URL endpoint stream camera

#### map_beacon
Cấu hình hệ thống định vị beacon cho điều hướng trong nhà.

**Mục đích**: Điểm tham chiếu không gian cho định vị xe đẩy và điều hướng trong môi trường bán lẻ.

**Các Trường Chính**:
- `map_id`: Định danh instance bản đồ
- `beacon_id`: Định danh beacon riêng lẻ
- `beacon_mac_address`: Địa chỉ MAC phần cứng beacon
- `beacon_x_coordinate`: Tọa độ vị trí trục X
- `beacon_y_coordinate`: Tọa độ vị trí trục Y
- `beacon_D0`: Giá trị RSSI tại khoảng cách 1 mét (dBm)
- `beacon_n`: Hệ số suy hao tín hiệu môi trường

#### map
Hệ thống ánh xạ không gian dựa trên lưới.

**Mục đích**: Hệ thống tọa độ rời rạc cho biểu diễn không gian bán lẻ và phân loại khu vực.

**Các Trường Chính**:
- `map_id`: Định danh instance bản đồ
- `x_coordinate`: Vị trí lưới X (số nguyên)
- `y_coordinate`: Vị trí lưới Y (số nguyên)
- `area`: Phân loại khu vực hoặc định danh vùng

**Hệ Thống Lưới**: Triển khai hệ thống tọa độ 10x10 cho ánh xạ không gian.

## Khởi Tạo Dữ Liệu

Cơ sở dữ liệu bao gồm khởi tạo dữ liệu mẫu toàn diện trên tất cả các bảng:

### Dữ Liệu Product Master
- **698 mục sản phẩm** bao gồm các danh mục thực phẩm và đồ uống
- Loại sản phẩm bao gồm: food, drink
- Phân loại khu vực: A1, A2, A3
- Khoảng giá: 4,500 - 50,000 VND
- Sản phẩm hỗn hợp bán theo đơn vị và theo cân

### Dữ Liệu Cấu Hình Cart
- **Hai xe đẩy được cấu hình**: Cart 142 và Cart 105
- Cấu hình BLE UUID hoàn chỉnh cho tất cả dịch vụ
- URL streaming camera được cấu hình
- Gán địa chỉ MAC cho nhận dạng phần cứng

### Nội Dung Cart Mẫu
- **Cart 142**: 10 sản phẩm đa dạng (hỗn hợp sản phẩm bán theo đơn vị và theo cân)
- **Cart 105**: 7 sản phẩm với số lượng khác nhau
- Thể hiện cả tình huống đếm và cân

### Dữ Liệu Hệ Thống Định Vị
- **Cấu hình 4 beacon** cho map_id 510
- Tọa độ beacon bao phủ các góc lưới 10x10
- Hiệu chuẩn RSSI tiêu chuẩn (-60.0 dBm tại 1m)
- Hệ số môi trường 1.8 cho suy hao tín hiệu

### Dữ Liệu Ánh Xạ Không Gian
- **Hệ thống lưới 100 tọa độ** (10x10)
- Phân loại khu vực: '1' (có thể truy cập), '0' (hạn chế), 'entrance'
- Bao phủ tọa độ hoàn chỉnh cho map_id 510

## Cân Nhắc Hiệu Suất

### Chiến Lược Indexing
- `product_master`: Index trên product_name để tối ưu tìm kiếm
- `cart_items`: Khóa chính tổng hợp cho phép tra cứu cart-product hiệu quả
- `map_beacon`: Khóa chính tổng hợp hỗ trợ truy vấn không gian
- `map`: Khóa chính tổng hợp cho phép hoạt động dựa trên tọa độ

### Tính Toàn Vẹn Dữ Liệu
- Ràng buộc khóa ngoại đảm bảo tính toàn vẹn tham chiếu
- Độ chính xác decimal duy trì độ chính xác cho giao dịch dựa trên trọng lượng
- Trường timestamp cung cấp chức năng audit trail
- Cấu hình character set hỗ trợ tên sản phẩm quốc tế

## Mẫu Sử Dụng Schema

### Quản Lý Sản Phẩm
- Hỗ trợ cả bán theo đơn vị rời rạc và bán theo cân liên tục
- Theo dõi tồn kho với độ chính xác decimal
- Hỗ trợ thông tin sản phẩm đa ngôn ngữ

### Hoạt Động Cart
- Sửa đổi nội dung giỏ hàng thời gian thực
- Quản lý khám phá và kết nối dịch vụ BLE
- Tích hợp stream camera cho ứng dụng computer vision

### Định Vị Không Gian
- Hệ thống định vị trong nhà dựa trên beacon
- Quản lý khu vực và điều hướng dựa trên lưới
- Hiệu chuẩn cường độ tín hiệu để ước tính khoảng cách

## Điểm Tích Hợp

Schema cơ sở dữ liệu này hỗ trợ tích hợp với:
- Dịch vụ FastAPI REST cho quản lý cart và sản phẩm
- Giao thức giao tiếp BLE cho tương tác phần cứng cart
- Dịch vụ computer vision cho phát hiện sản phẩm tự động
- Dịch vụ streaming thời gian thực cho cập nhật inventory
- Thuật toán định vị không gian cho theo dõi cart

## Ghi Chú Triển Khai

Khởi tạo cơ sở dữ liệu diễn ra tự động thông qua orchestration Docker Compose. Các file SQL thực thi theo thứ tự số đảm bảo giải quyết dependency đúng và tính nhất quán dữ liệu.
