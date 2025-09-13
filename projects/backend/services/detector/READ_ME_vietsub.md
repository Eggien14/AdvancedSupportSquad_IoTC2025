# Tài Liệu Dịch Vụ Computer Vision Detection

## Tổng Quan

Tài liệu này mô tả dịch vụ computer vision detection cho Smart Shopping Cart System được phát triển bởi nhóm Advanced Support Squad trong khuôn khổ cuộc thi IoT Challenge 2025 "Edge AI for smart retail" do FPT Software và Silicon Labs phối hợp tổ chức. Dịch vụ detection triển khai object detection thời gian thực sử dụng YOLOv8 để nhận dạng sản phẩm trong giỏ hàng thông qua camera streams.

## Mục Tiêu và Chức Năng Dịch Vụ

### Mục Tiêu Chính
- Thực thi các tiến trình detection đa luồng để giám sát đồng thời nhiều giỏ hàng
- Thực hiện object detection YOLOv8 định kỳ với intervals detection có thể cấu hình
- Cung cấp phản hồi hình ảnh thời gian thực thông qua bounding box rendering và frame annotation
- Duy trì inventory tracking trong memory với cập nhật số lượng sản phẩm tự động
- Phân phối các API endpoints độ trễ thấp cho image streaming và truy cập dữ liệu inventory

### Chức Năng Cốt Lõi
- **Real-time Object Detection**: Nhận dạng sản phẩm dựa trên YOLOv8 với confidence scoring
- **Quản Lý Multi-cart**: Xử lý đồng thời nhiều camera streams với thread isolation
- **Visual Annotation**: Bounding box rendering với product labels và confidence percentages
- **Inventory Tracking**: Đếm sản phẩm tự động và quản lý trạng thái inventory
- **Stream Processing**: Tích hợp HTTP/MJPEG/RTSP camera stream với xử lý reconnection

### Đặc Tả Input/Output
**Nguồn Input**:
- HTTP/MJPEG/RTSP camera streams qua OpenCV VideoCapture
- Tham số cấu hình dựa trên environment
- Pre-trained YOLOv8 model weights

**Giao Diện Output**:
- RESTful API endpoints trả về JSON inventory data
- Real-time JPEG image streams với visual annotations
- Health monitoring endpoints để xác minh trạng thái dịch vụ

## Cấu Trúc Thư Mục

```
services/detector/
├── app.py                  # Ứng dụng FastAPI với lifespan management
├── object_detect.py        # Lớp ObjectDetector và thread orchestration
├── draw_frame.py          # Hàm visualization cho bounding box rendering
├── state.py               # Quản lý storage trong memory thread-safe
├── config.py              # Tham số cấu hình và label mapping
├── models/
│   └── my_model.pt        # YOLOv8 model weights (đường dẫn configurable)
├── Dockerfile             # Cấu hình container CPU-optimized
├── requirements.txt       # Đặc tả Python dependencies
└── detector_endpoint.txt  # Tài liệu API endpoint
```

### Kiến Trúc Component

#### app.py - Application Bootstrap
**Mục đích**: Khởi tạo ứng dụng FastAPI với lifecycle management và định nghĩa endpoint.

**Tính Năng Chính**:
- Asynchronous context manager cho service lifecycle
- Quản lý thread trong giai đoạn startup và shutdown
- Triển khai RESTful API endpoint
- Xử lý lỗi và quản lý HTTP status code

#### object_detect.py - Detection Engine
**Mục đích**: Xử lý computer vision cốt lõi với YOLO integration và thread management.

**Tính Năng Chính**:
- Lớp `ObjectDetector` với tham số detection có thể cấu hình
- Xử lý camera stream đa luồng với automatic reconnection
- Tích hợp YOLO model với CPU-only optimization
- Tính toán frame rate và performance monitoring
- Cập nhật inventory state với product quantity tracking

#### state.py - Memory Management
**Mục đích**: Thread-safe in-memory storage cho truy cập dữ liệu thời gian thực.

**Tính Năng Chính**:
- Thread-safe JPEG image storage với cart-specific isolation
- Quản lý inventory data với timestamp tracking
- Đồng bộ hóa dựa trên lock cho concurrent access
- Sử dụng memory hiệu quả cho high-frequency updates

#### config.py - Configuration Management
**Mục đích**: Quản lý cấu hình tập trung với hỗ trợ environment variable.

**Tính Năng Chính**:
- Cấu hình model path với khả năng environment override
- Định nghĩa camera source với cart identification mapping
- Tham số detection bao gồm confidence thresholds và intervals
- Label-to-product-ID mapping cho inventory management
- Định nghĩa color scheme cho visual annotation

#### draw_frame.py - Visualization Engine
**Mục đích**: Frame annotation thời gian thực với bounding box rendering.

**Tính Năng Chính**:
- Vẽ bounding box với confidence-based filtering
- Label rendering với background rectangles cho visibility
- Đếm object với frame overlay statistics
- Visualization color-coded dựa trên detection confidence

## Luồng Xử Lý

### Service Initialization Flow
1. **Application Startup**: FastAPI lifespan manager khởi tạo service components
2. **Thread Orchestration**: `start_all_detectors()` tạo một detection thread cho mỗi cart được cấu hình
3. **Model Loading**: YOLOv8 model initialization với CPU-only constraints
4. **Camera Connection**: OpenCV VideoCapture initialization với stream validation

### Detection Processing Pipeline
1. **Frame Acquisition**: Capture frame liên tục từ camera streams với timeout handling
2. **Frame Preprocessing**: Resize ảnh về kích thước đã cấu hình (mặc định 480x480)
3. **Detection Execution**: YOLOv8 inference execution với intervals có thể cấu hình (mặc định mỗi 7 frames)
4. **Result Processing**: Confidence filtering và label mapping sang product identifiers
5. **Inventory Updates**: Cập nhật inventory state thread-safe trong memory storage
6. **Visual Annotation**: Bounding box rendering với labels và confidence scores
7. **JPEG Encoding**: Frame encoding cho real-time streaming qua API endpoints

### Data Management Flow
1. **state.py Operations**: Storage và retrieval thread-safe của image và inventory data
2. **Memory Optimization**: JPEG encoding và storage hiệu quả cho latency tối thiểu
3. **Timestamp Management**: ISO UTC timestamp tracking cho inventory updates
4. **Concurrent Access**: Đồng bộ hóa dựa trên lock cho multi-thread safety

## Định Dạng Dữ Liệu Input/Output

### Đặc Tả API Endpoint

#### Health Check Endpoint
```
GET /healthz
Response: 200 OK
Content-Type: application/json
{
    "status": "ok"
}
```

#### Image Stream Endpoint
```
GET /image?cart_id={integer}
Parameters:
- cart_id: Cart identifier (bắt buộc)

Response: 200 OK
Content-Type: image/jpeg
Headers: Cache-Control: no-store
Body: Binary JPEG data với visual annotations

Error Response: 404 Not Found
- Không có frame cho cart_id được chỉ định
```

#### Inventory Data Endpoint
```
GET /inventory?cart_id={integer}
Parameters:
- cart_id: Cart identifier (bắt buộc)

Response: 200 OK
Content-Type: application/json
{
    "cart_id": 142,
    "updated_at": "2025-09-13T10:30:15.123456+00:00",
    "items": [
        {
            "product_id": 6,
            "quantity": 1
        },
        {
            "product_id": 1,
            "quantity": 2
        }
    ]
}
```

### Định Dạng Configuration Data

#### Biến Môi Trường
- `MODEL_PATH`: Đường dẫn YOLOv8 model file (mặc định: ./models/my_model.pt)
- `PORT`: Số port dịch vụ (mặc định: 8100)

#### Tham Số Detection
- `IMG_SIZE`: Tuple kích thước frame (width, height) - mặc định: (480, 480)
- `MIN_CONF_THRESHOLD`: Ngưỡng confidence detection - mặc định: 0.7
- `DETECT_INTERVAL`: Tần suất detection theo frames - mặc định: 7

#### Cấu Hình Cart
```python
CARTS = [
    {
        "cart_id": 142,
        "source": "http://192.168.0.102:81/stream"
    }
]
```

#### Cấu Hình Label Mapping
```python
LABEL_TO_ID = {
    'ballpoints_pen': 11,
    'c2_lemon_tea': 7,
    'cal_cheese': 2,
    # ... ánh xạ sản phẩm bổ sung
}
```

### Tối Ưu Hiệu Suất

#### CPU-Only Optimization
- Cài đặt PyTorch CPU-only cho memory footprint giảm
- Cấu hình OpenCV headless cho triển khai server
- Xử lý parallel dựa trên thread cho multiple cart streams
- Detection intervals có thể cấu hình để cân bằng accuracy và performance

#### Memory Management
- JPEG storage trong memory với automatic cleanup
- Cấu trúc dữ liệu thread-safe cho concurrent access
- Frame encoding hiệu quả với latency overhead tối thiểu
- Buffer sizes có thể cấu hình cho stream processing

#### Network Optimization
- Camera stream reconnection với exponential backoff
- Tối ưu HTTP header cho real-time streaming
- API response payloads tối thiểu cho reduced bandwidth usage

## Cấu Hình Triển Khai

### Đặc Tả Container
- **Base Image**: python:3.11-slim
- **System Dependencies**: libglib2.0-0, libgl1, libgomp1
- **Python Dependencies**: FastAPI, Ultralytics, OpenCV-headless
- **Exposed Port**: 8100
- **CPU Optimization**: PyTorch CPU-only với CUDA disabled

### Tích Hợp Docker Compose
```yaml
detector:
  build:
    context: .
    dockerfile: services/detector/Dockerfile
  environment:
    - MODEL_PATH=/app/services/detector/models/my_model.pt
  ports:
    - "8100:8100"
  volumes:
    - ./services/detector/models:/app/services/detector/models:ro
```

### Môi Trường Development
- Local development với hỗ trợ virtual environment
- Khả năng hot reload cho development iterations
- Cấu hình environment variable cho triển khai linh hoạt
- Hỗ trợ LAN access cho multi-device testing

Dịch vụ computer vision detection này cung cấp khả năng object detection thời gian thực cần thiết cho chức năng Edge AI của Smart Shopping Cart System, phân phối nhận dạng sản phẩm chính xác với hiệu suất được tối ưu cho môi trường retail.
