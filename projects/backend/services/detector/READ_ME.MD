# Computer Vision Detection Service Documentation

## Overview

This document describes the computer vision detection service for the Smart Shopping Cart System developed by Advanced Support Squad team for IoT Challenge 2025 "Edge AI for smart retail", co-organized by FPT Software and Silicon Labs. The detection service implements real-time object detection using YOLOv8 to identify products in shopping carts through camera streams.

## Service Objectives and Functions

### Primary Objectives
- Execute multi-threaded detection processes for simultaneous monitoring of multiple shopping carts
- Perform periodic YOLOv8 object detection with configurable detection intervals
- Provide real-time visual feedback through bounding box rendering and frame annotation
- Maintain in-memory inventory tracking with automatic product quantity updates
- Deliver low-latency API endpoints for image streaming and inventory data access

### Core Functions
- **Real-time Object Detection**: YOLOv8-based product identification with confidence scoring
- **Multi-cart Management**: Concurrent processing of multiple camera streams with thread isolation
- **Visual Annotation**: Bounding box rendering with product labels and confidence percentages
- **Inventory Tracking**: Automatic product counting and inventory state management
- **Stream Processing**: HTTP/MJPEG/RTSP camera stream integration with reconnection handling

### Input/Output Specifications
**Input Sources**:
- HTTP/MJPEG/RTSP camera streams via OpenCV VideoCapture
- Environment-based configuration parameters
- Pre-trained YOLOv8 model weights

**Output Interfaces**:
- RESTful API endpoints returning JSON inventory data
- Real-time JPEG image streams with visual annotations
- Health monitoring endpoints for service status verification

## Directory Structure

```
services/detector/
├── app.py                  # FastAPI application with lifespan management
├── object_detect.py        # ObjectDetector class and thread orchestration
├── draw_frame.py          # Visualization functions for bounding box rendering
├── state.py               # Thread-safe in-memory storage management
├── config.py              # Configuration parameters and label mapping
├── models/
│   └── my_model.pt        # YOLOv8 model weights (configurable path)
├── Dockerfile             # CPU-optimized container configuration
├── requirements.txt       # Python dependencies specification
└── detector_endpoint.txt  # API endpoint documentation
```

### Component Architecture

#### app.py - Application Bootstrap
**Purpose**: FastAPI application initialization with lifecycle management and endpoint definitions.

**Key Features**:
- Asynchronous context manager for service lifecycle
- Thread management during startup and shutdown phases
- RESTful API endpoint implementations
- Error handling and HTTP status code management

#### object_detect.py - Detection Engine
**Purpose**: Core computer vision processing with YOLO integration and thread management.

**Key Features**:
- `ObjectDetector` class with configurable detection parameters
- Multi-threaded camera stream processing with automatic reconnection
- YOLO model integration with CPU-only optimization
- Frame rate calculation and performance monitoring
- Inventory state updates with product quantity tracking

#### state.py - Memory Management
**Purpose**: Thread-safe in-memory storage for real-time data access.

**Key Features**:
- Thread-safe JPEG image storage with cart-specific isolation
- Inventory data management with timestamp tracking
- Lock-based synchronization for concurrent access
- Efficient memory utilization for high-frequency updates

#### config.py - Configuration Management
**Purpose**: Centralized configuration with environment variable support.

**Key Features**:
- Model path configuration with environment override capability
- Camera source definitions with cart identification mapping
- Detection parameters including confidence thresholds and intervals
- Label-to-product-ID mapping for inventory management
- Color scheme definitions for visual annotation

#### draw_frame.py - Visualization Engine
**Purpose**: Real-time frame annotation with bounding box rendering.

**Key Features**:
- Bounding box drawing with confidence-based filtering
- Label rendering with background rectangles for visibility
- Object counting with frame overlay statistics
- Color-coded visualization based on detection confidence

## Processing Workflow

### Service Initialization Flow
1. **Application Startup**: FastAPI lifespan manager initiates service components
2. **Thread Orchestration**: `start_all_detectors()` creates one detection thread per configured cart
3. **Model Loading**: YOLOv8 model initialization with CPU-only constraints
4. **Camera Connection**: OpenCV VideoCapture initialization with stream validation

### Detection Processing Pipeline
1. **Frame Acquisition**: Continuous frame capture from camera streams with timeout handling
2. **Frame Preprocessing**: Image resizing to configured dimensions (480x480 default)
3. **Detection Execution**: YOLOv8 inference execution at configurable intervals (every 7 frames default)
4. **Result Processing**: Confidence filtering and label mapping to product identifiers
5. **Inventory Updates**: Thread-safe inventory state updates in memory storage
6. **Visual Annotation**: Bounding box rendering with labels and confidence scores
7. **JPEG Encoding**: Frame encoding for real-time streaming via API endpoints

### Data Management Flow
1. **state.py Operations**: Thread-safe storage and retrieval of image and inventory data
2. **Memory Optimization**: Efficient JPEG encoding and storage for minimal latency
3. **Timestamp Management**: ISO UTC timestamp tracking for inventory updates
4. **Concurrent Access**: Lock-based synchronization for multi-thread safety

## Input/Output Data Formats

### API Endpoint Specifications

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
- cart_id: Cart identifier (required)

Response: 200 OK
Content-Type: image/jpeg
Headers: Cache-Control: no-store
Body: Binary JPEG data with visual annotations

Error Response: 404 Not Found
- No frame available for specified cart_id
```

#### Inventory Data Endpoint
```
GET /inventory?cart_id={integer}
Parameters:
- cart_id: Cart identifier (required)

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

### Configuration Data Formats

#### Environment Variables
- `MODEL_PATH`: YOLOv8 model file path (default: ./models/my_model.pt)
- `PORT`: Service port number (default: 8100)

#### Detection Parameters
- `IMG_SIZE`: Frame dimensions tuple (width, height) - default: (480, 480)
- `MIN_CONF_THRESHOLD`: Detection confidence threshold - default: 0.7
- `DETECT_INTERVAL`: Detection frequency in frames - default: 7

#### Cart Configuration
```python
CARTS = [
    {
        "cart_id": 142,
        "source": "http://192.168.0.102:81/stream"
    }
]
```

#### Label Mapping Configuration
```python
LABEL_TO_ID = {
    'ballpoints_pen': 11,
    'c2_lemon_tea': 7,
    'cal_cheese': 2,
    # ... additional product mappings
}
```

### Performance Optimization

#### CPU-Only Optimization
- PyTorch CPU-only installation for reduced memory footprint
- OpenCV headless configuration for server deployment
- Thread-based parallel processing for multiple cart streams
- Configurable detection intervals to balance accuracy and performance

#### Memory Management
- In-memory JPEG storage with automatic cleanup
- Thread-safe data structures for concurrent access
- Efficient frame encoding with minimal latency overhead
- Configurable buffer sizes for stream processing

#### Network Optimization
- Camera stream reconnection with exponential backoff
- HTTP header optimization for real-time streaming
- Minimal API response payloads for reduced bandwidth usage

## Deployment Configuration

### Container Specifications
- **Base Image**: python:3.11-slim
- **System Dependencies**: libglib2.0-0, libgl1, libgomp1
- **Python Dependencies**: FastAPI, Ultralytics, OpenCV-headless
- **Exposed Port**: 8100
- **CPU Optimization**: PyTorch CPU-only with CUDA disabled

### Docker Compose Integration
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

### Development Environment
- Local development with virtual environment support
- Hot reload capability for development iterations
- Environment variable configuration for flexible deployment
- LAN access support for multi-device testing

This computer vision detection service provides the real-time object detection capabilities essential for the Smart Shopping Cart System's Edge AI functionality, delivering accurate product identification with optimized performance for retail environments.
