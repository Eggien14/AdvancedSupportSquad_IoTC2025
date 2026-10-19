
# SMART SHOPPING CART SYSTEM - SERVER PLATFORM
Version: 2.1 | Last updated: 2025-09-13
Team: Advanced Support Squad | Organization: FPT Software & Silicon Labs

---

## 1. SERVER DIRECTORY STRUCTURE

```
ASS_server/
│
├── .env                  # Environment variable configuration
├── docker-compose.yaml   # Docker Compose config (production)
├── docker-compose.simple.yaml # Docker Compose config (development)
├── docker.ps1            # PowerShell script for service management
├── how_to_run.txt        # Quick deployment guide
├── lib_requirement.txt   # Python library requirements
├── server_endpoint.txt   # System-wide endpoint list
├── README.md             # System documentation (English)
├── README_vietsub.md     # System documentation (Vietnamese)
│
├── ASS_env/              # Python virtual environment (do not edit manually)
│
├── db/                   # Database scripts and sample data
│   ├── db_init/          # MySQL schema initialization scripts
│   └── db_insert/        # Sample data SQL scripts
│
├── logs/                 # System log files
│   ├── api/              # API service logs
│   └── detector/         # Detector service logs
│
├── models/               # AI model files (YOLOv8, etc.)
│
├── nginx/                # Nginx reverse proxy configuration
│   ├── nginx.conf        # Main Nginx config file
│   ├── generate-ssl.sh   # SSL certificate generation script
│   └── certs/            # SSL certificate storage
│
├── services/             # Main service source code
│   ├── api/              # API service (FastAPI)
│   │   ├── server.py         # API service entry point
│   │   ├── requirements.txt  # API Python dependencies
│   │   ├── api_endpoint.txt  # API endpoint list
│   │   └── schemas/          # Data schema definitions
│   ├── detector/         # Computer Vision service (YOLOv8)
│   │   ├── app.py            # Detector service entry point
│   │   ├── object_detect.py  # Object detection logic
│   │   ├── config.py         # Detector configuration
│   │   └── models/           # Detector AI models
│   └── shared/           # Data access & shared logic
│       ├── db.py             # Database connection & queries
│       ├── repos.py          # Repository pattern
│       ├── services.py       # Business logic
│       └── settings.py       # Configuration management
│
├── storage/               # Image and detection frame storage
│   ├── cam_detect/        # Camera cart images
│   └── frames/            # Temporary detection frames
│
└── my_model.pt            # Main AI model file (YOLOv8)
```

**Key component descriptions:**
- `docker-compose.yaml`, `docker-compose.simple.yaml`: Full system orchestration for production/development.
- `docker.ps1`: PowerShell script for starting/stopping/logging services.
- `how_to_run.txt`: Quick deployment instructions for new users.
- `lib_requirement.txt`: Python library requirements for the entire system.
- `server_endpoint.txt`: Complete REST/WebSocket endpoint reference.
- `ASS_env/`: Python virtual environment, do not edit manually.
- `db/`: MySQL schema and sample data scripts.
- `logs/`: Service log storage.
- `models/`: AI model files (YOLOv8, etc.).
- `nginx/`: Reverse proxy, SSL, and related scripts.
- `services/`: Main service source code (API, detector, shared).
- `storage/`: Image and detection frame storage for computer vision.
- `my_model.pt`: Main AI model file for detector.

---

## Table of Contents

1. Project Overview
2. System Architecture
3. Core Infrastructure
4. Service Components
5. Deployment Architecture
6. Quick Start Guide
7. Configuration Management
8. Networking & Security
9. Performance & Monitoring
10. Documentation Structure
11. Troubleshooting
12. Development Process

---

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [System Architecture](#-system-architecture)
3. [Core Infrastructure](#-core-infrastructure)
4. [Service Components](#-service-components)
5. [Deployment Architecture](#-deployment-architecture)
6. [Quick Start Guide](#-quick-start-guide)
7. [Configuration Management](#-configuration-management)
8. [Network & Security](#-network--security)
9. [Performance & Monitoring](#-performance--monitoring)
10. [Documentation Structure](#-documentation-structure)
11. [Troubleshooting](#-troubleshooting)
12. [Development Workflow](#-development-workflow)

---

## 🎯 Project Overview

The **Smart Shopping Cart System** represents a comprehensive IoT solution engineered for the **IoT Challenge 2025 "Edge AI for smart retail"** competition. This server platform integrates cutting-edge computer vision, real-time data processing, and intelligent inventory management to revolutionize retail shopping experiences.

### Key Innovation Areas

- **🔍 Edge AI Processing**: Real-time YOLOv8 object detection optimized for retail environments
- **🛒 Intelligent Cart Management**: Advanced shopping cart operations with multiple update modes
- **📊 Smart Inventory Tracking**: Automated inventory monitoring with computer vision integration
- **🌐 Scalable API Architecture**: 29 REST endpoints + 5 WebSocket channels for comprehensive system control
- **⚡ Real-time Communication**: WebSocket-based live updates for seamless user experience
- **🔒 Enterprise Security**: Production-ready SSL/TLS with automatic certificate management
- **🚀 Flexible Deployment**: Multiple deployment strategies from development to enterprise production

### Technology Stack Overview

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Reverse Proxy** | Nginx | Latest | SSL termination, load balancing, security |
| **API Framework** | FastAPI | 0.104.1 | High-performance async Python web framework |
| **Computer Vision** | YOLOv8 (Ultralytics) | 8.0.196 | Real-time object detection and classification |
| **Database** | MySQL | 8.0 | ACID-compliant data persistence with UTF8MB4 |
| **Containerization** | Docker & Docker Compose | Latest | Service orchestration and deployment |
| **Python Runtime** | Python | 3.11+ | Core application runtime environment |
| **ML Framework** | PyTorch | CPU-optimized | Computer vision model inference |

### Competition Context

This project showcases advanced **Edge AI capabilities** for smart retail, demonstrating:
- Real-time AI processing at the retail edge without cloud dependency
- Scalable microservices architecture for production deployment
- Integration of computer vision with traditional retail systems
- Comprehensive system monitoring and management capabilities

---

## 🏗️ System Architecture

### High-Level Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                           Smart Shopping Cart System                          │
│                              Server Platform                                  │
└───────────────────────────────────────────────────────────────────────────────┘

🌐 External Access Layer
├── 📱 Mobile Applications (iOS/Android)
├── 💻 Web Applications (React/Vue.js)
├── 🔌 IoT Cart Devices (ESP32/Raspberry Pi)
└── 🌍 Third-party Integrations (POS systems, ERP)

🔀 Nginx Reverse Proxy Layer (Production Gateway)
├── 🔒 SSL/TLS Termination (Port 8118 HTTPS)
├── 🌐 HTTP Load Balancing (Port 8136 HTTP)  
├── 📊 Static Content Serving & Caching
├── 🛡️ Security Headers & DDoS Protection
├── 📈 Request Rate Limiting & Throttling
└── 🔄 WebSocket Proxy & Upgrade Handling

🚀 Application Services Layer (Microservices)
├── 📡 API Service (FastAPI - Internal Port 8136)
│   ├── 🛒 Shopping Cart Management (6 endpoints)
│   ├── 📦 Product Catalog Operations (8 endpoints)
│   ├── 📊 Inventory Control Systems (5 endpoints)  
│   ├── 🗺️ Map & Beacon Management (10 endpoints)
│   ├── 📈 Analytics & Reporting (5 endpoints)
│   ├── 🌐 Real-time WebSocket Channels (5 streams)
│   └── 💓 Health Monitoring & System Status
│
├── 🔍 Detector Service (YOLOv8 - Internal Port 8100)
│   ├── 🖼️ Image Processing Pipeline (OpenCV)
│   ├── 🎯 Object Detection & Classification
│   ├── 📊 Inventory Recognition & Counting
│   ├── ⚡ Real-time Vision Processing (CPU-optimized)
│   └── 🔧 Model Management & Configuration
│
└── 🔧 Shared Services Layer (services/shared)
    ├── 🗄️ Database Access Layer (DAL) - PyMySQL
    ├── 📋 Business Logic Services & Validation
    ├── ⚙️ Configuration Management & Settings
    ├── 🔧 Utility Functions & Helper Methods
    └── 📊 Cross-service Communication Protocols

🗄️ Data Persistence Layer
├── 🐬 MySQL Database (External Port 3308, Internal 3306)
│   ├── 📦 Product Master Catalog (product_master)
│   ├── 🛒 Shopping Cart Inventory (cart_items)
│   ├── 🔧 Cart Configuration Management (cart_config)
│   ├── 📍 Beacon Positioning System (map_beacon)
│   └── 🗺️ Store Layout Mapping (map)
├── 💾 File Storage System
│   ├── 🖼️ Product Images & Media Assets
│   ├── 📸 Detection Frames & Video Streams
│   └── 📋 System Logs & Audit Trails
└── ⚡ Caching Layer (Optional Redis Integration)
    ├── 🔄 Session State Management
    ├── 📊 Analytics Data Caching
    └── 🚀 API Response Optimization
```

### Service Communication Flow

```
📱 Client Request Flow:
┌─────────────┐   HTTPS/WSS    ┌─────────────┐   HTTP/WS     ┌─────────────┐
│   External  │ ─────────────► │    Nginx    │ ────────────► │ API Service │
│   Clients   │                │   Proxy     │               │  (FastAPI)  │
└─────────────┘                └─────────────┘               └──────┬──────┘
                                                                    │
                                                               Shared Layer
                                                                Imports
                                                                    │
🔍 Computer Vision Flow:                                     ┌──────▼──────┐
┌─────────────┐   Detection    ┌─────────────┐   Results   │  services/  │
│ Image Input │ ─────────────► │  Detector   │ ──────────► │   shared    │
│ (Cameras)   │                │  Service    │             │ (Database)  │
└─────────────┘                │  (YOLOv8)   │             └──────┬──────┘
                               └─────────────┘                    │
                                                             Database
🗄️ Data Flow:                                              Operations
┌─────────────┐   SQL Queries  ┌─────────────┐                    │
│  Business   │ ─────────────► │  MySQL 8.0  │ ◄──────────────────┘
│   Logic     │                │  Database   │
└─────────────┘                └─────────────┘
```

### Network Topology

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

## 🔧 Core Infrastructure

### Database Architecture (MySQL 8.0)

#### Configuration Specifications
- **Engine**: InnoDB with ACID compliance
- **Character Set**: UTF8MB4 with Unicode collation support
- **Authentication**: mysql_native_password for compatibility
- **Port Mapping**: External 3308 → Internal 3306
- **Performance**: Optimized with connection pooling and query caching

#### Database Schema Overview
```sql
-- Core Tables Structure
CREATE DATABASE iotc25_advanced_support_squad 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Product Management System
CREATE TABLE product_master (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(255) NOT NULL,
    product_type VARCHAR(64) NOT NULL,
    area VARCHAR(64),                    -- Store area/section
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 0.000,
    weight_kg DECIMAL(8,3) DEFAULT NULL, -- Product weight
    manufacturer VARCHAR(128),
    expiry_or_mfg_date DATE,
    origin VARCHAR(128),                 -- Country of origin
    info1 VARCHAR(255),                  -- Additional info field 1
    info2 VARCHAR(255),                  -- Additional info field 2
    detail1 VARCHAR(255),                -- Detail field 1
    detail2 VARCHAR(255),                -- Detail field 2
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product_type (product_type),
    INDEX idx_area (area),
    INDEX idx_name (product_name)
);

-- Shopping Cart Inventory
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

-- Cart Configuration & Management
CREATE TABLE cart_config (
    cart_id INT PRIMARY KEY,
    cart_mac_address VARCHAR(32) UNIQUE,
    cart_position VARCHAR(128),          -- Current position coordinates
    cart_state VARCHAR(32),              -- active, inactive, maintenance
    cart_voice_cmd VARCHAR(255),         -- Voice command capabilities
    cart_firmware_update VARCHAR(128),   -- Firmware version info
    cam_stream_url VARCHAR(255),         -- Camera stream endpoint
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mac_address (cart_mac_address),
    INDEX idx_state (cart_state)
);

-- Bluetooth Beacon Positioning System
CREATE TABLE map_beacon (
    map_id INT NOT NULL,
    beacon_id VARCHAR(32) NOT NULL,
    beacon_mac_address VARCHAR(32),
    beacon_x_coordinate DECIMAL(10,3),   -- X position in store grid
    beacon_y_coordinate DECIMAL(10,3),   -- Y position in store grid
    beacon_D0 DECIMAL(6,2),              -- Reference distance (meters)
    beacon_n DECIMAL(4,2),               -- Path loss exponent
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (map_id, beacon_id),
    INDEX idx_coordinates (beacon_x_coordinate, beacon_y_coordinate),
    INDEX idx_mac_address (beacon_mac_address)
);

-- Store Layout Grid System
CREATE TABLE map (
    map_id INT NOT NULL,
    x_coordinate INT NOT NULL,           -- Grid X coordinate
    y_coordinate INT NOT NULL,           -- Grid Y coordinate  
    area VARCHAR(64),                    -- Area designation (dairy, electronics, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (map_id, x_coordinate, y_coordinate),
    INDEX idx_area (area)
);
```

### Nginx Reverse Proxy Configuration

#### Core Nginx Features
- **SSL/TLS Termination**: Automatic certificate generation and renewal
- **Load Balancing**: Round-robin distribution across API service instances
- **WebSocket Support**: Seamless WebSocket proxy with connection upgrade
- **Security Headers**: Comprehensive security header injection
- **Static Content**: Efficient static file serving with caching
- **Rate Limiting**: Configurable request rate limiting per IP

#### Nginx Configuration Structure
```nginx
# Main HTTP Configuration
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
        
        # Timeout configuration
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # WebSocket support
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
        
        # Large file upload support
        client_max_body_size 50M;
        proxy_request_buffering off;
    }
}

# HTTPS Server (Port 8118) - Production Only
server {
    listen 443 ssl http2;
    server_name _;
    
    # SSL Configuration
    ssl_certificate /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS Security
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Same location blocks as HTTP with SSL termination
    location / {
        proxy_pass http://api_backend;
        # ... same proxy configuration
    }
}
```

---

## 🎛️ Service Components

### API Service (FastAPI) - Core REST Interface

**📍 Location**: `services/api/`  
**📚 Complete Documentation**: `services/api/README.md`  
**🔗 Endpoint Reference**: `services/api/api_endpoint.txt`  
**🌐 Interactive Documentation**: http://localhost:8136/docs

#### Service Capabilities
- **29 REST API Endpoints** across 6 functional categories
- **Real-time WebSocket Communication** for live cart updates
- **Advanced Cart Management** with 3 update modes (replace/merge/delta)
- **Comprehensive Product Catalog** with search and filtering
- **Analytics & Reporting** with business intelligence features
- **Health Monitoring** with detailed system status reporting

#### Key Technical Features
- **Async/Await Architecture**: Non-blocking I/O for high concurrency
- **Pydantic Data Validation**: Type-safe request/response handling
- **Automatic API Documentation**: OpenAPI 3.0 with Swagger UI
- **CORS Support**: Configurable cross-origin resource sharing
- **Error Handling**: Comprehensive exception handling with proper HTTP status codes

### Detector Service (YOLOv8) - Computer Vision Engine

**📍 Location**: `services/detector/`  
**📚 Complete Documentation**: `services/detector/README.md`  
**🔗 Endpoint Reference**: `services/detector/detector_endpoint.txt`  
**🌐 Interactive Documentation**: http://localhost:8100/docs

#### Computer Vision Capabilities
- **Real-time Object Detection** using YOLOv8 neural networks
- **Inventory Recognition & Counting** for automated stock management
- **CPU-optimized Processing** with PyTorch CPU-only inference
- **Multi-format Support** for JPEG, PNG, BMP, WEBP images
- **Configurable Confidence Thresholds** for detection accuracy tuning

#### Technical Implementation
- **Model**: Custom-trained YOLOv8 for retail product recognition
- **Performance**: ~200-500ms processing time per image
- **Memory**: Optimized for low-memory environments (2GB+ recommended)
- **Threading**: Thread-safe state management for concurrent requests

### Shared Services Layer - Data Access Foundation

**📍 Location**: `services/shared/`  
**📚 Complete Documentation**: `services/shared/README.md`

#### Architecture Pattern
The shared services layer implements a **4-tier architecture**:
1. **Settings Layer** (`settings.py`): Configuration management
2. **Database Layer** (`db.py`): Connection management and utilities
3. **Repository Layer** (`repos.py`): Data access abstraction
4. **Service Layer** (`services.py`): Business logic implementation

#### Key Responsibilities
- **Centralized Database Access**: Single point of database connectivity
- **Business Logic Abstraction**: Reusable business rules and validation
- **Configuration Management**: Environment-based configuration handling
- **Cross-service Communication**: Shared protocols between API and Detector services

---

## 🚀 Deployment Architecture

### Docker Compose Configurations

#### Production Configuration (docker-compose.yaml)
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
      MYSQL_ROOT_PASSWORD: your_root_password
      MYSQL_DATABASE: iotc25_advanced_support_squad
      MYSQL_USER: eggien
      MYSQL_PASSWORD: your_db_password
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
      - "8136:80"    # HTTP access
      - "8118:443"   # HTTPS access
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

#### Development Configuration (docker-compose.simple.yaml)
- **Simplified Setup**: No nginx proxy, direct API access
- **Faster Startup**: Reduced health check intervals
- **Development Features**: Debug mode enabled, hot reload support
- **Port Mapping**: Direct access to API (8136) and Detector (8100)

### Management Script (docker.ps1)

#### Available Commands
```powershell
# Production deployment with full features
.\docker.ps1 full
# - Nginx proxy with SSL/TLS
# - HTTPS support on port 8118
# - Production security headers
# - Automatic certificate generation

# Development deployment (faster startup)
.\docker.ps1 simple  
# - Direct API access on port 8136
# - No SSL/nginx overhead
# - Ideal for development and testing

# Service management
.\docker.ps1 down      # Stop all services gracefully
.\docker.ps1 restart   # Restart current configuration
.\docker.ps1 logs      # View aggregated logs
.\docker.ps1 status    # Show container health status
```

---

## ⚡ Quick Start Guide

### Prerequisites Verification
```bash
# Check Docker installation
docker --version          # Required: 20.10+
docker-compose --version  # Required: 2.0+

# Verify available resources
docker system info | grep -E "CPUs|Total Memory"

# Check port availability
netstat -an | grep -E ":(8136|8118|8100|3308)"  # Should be empty
```

### Environment Setup
1. **Configure Network IP** in `.env` file:
   ```bash
   # Edit .env file with your actual IP address
   SERVER_IP=192.168.1.100  # Replace with your IP
   ```

2. **Verify Model File** exists:
   ```bash
   ls -la my_model.pt  # YOLOv8 model file (required for detector)
   ```

### Deployment Steps

#### Option 1: Automated Script (Recommended)
```bash
# Navigate to project directory
cd ASS_server

# Start development environment
.\docker.ps1 simple
# Wait for "SIMPLE Services started successfully!" message

# OR start production environment  
.\docker.ps1 full
# Wait for "FULL Services started successfully!" message

# Verify deployment
curl http://localhost:8136/healthz
curl http://localhost:8100/healthz
```

#### Option 2: Manual Docker Compose
```bash
# Development deployment
docker-compose -f docker-compose.simple.yaml up -d --build

# Production deployment
docker-compose up -d --build

# Monitor startup progress
docker-compose logs -f
```

### Access Points After Deployment
- **API Documentation**: http://localhost:8136/docs (Swagger UI)
- **API Alternative Docs**: http://localhost:8136/redoc (ReDoc)
- **Computer Vision Docs**: http://localhost:8100/docs
- **Production HTTPS**: https://localhost:8118/docs (full deployment only)
- **Health Checks**: 
  - API: http://localhost:8136/healthz
  - Detector: http://localhost:8100/healthz

---

## ⚙️ Configuration Management

### Environment Variables (.env)
```bash
# Network Configuration (Critical for SSL)
SERVER_IP=192.168.1.100           # Your actual network IP address

# Database Configuration  
DB_HOST=db                        # Docker service name
DB_PORT=3306                      # Internal MySQL port
DB_USER=eggien                    # Database username
DB_PASSWORD=your_db_password            # Database password
DB_NAME=iotc25_advanced_support_squad

# API Service Configuration
API_PORT=8136                     # API service port
CACHE_ENABLED=true                # Enable response caching
DEBUG=false                       # Debug mode (development only)

# Performance Tuning
UVICORN_WORKERS=1                 # API worker processes
MAX_CONNECTIONS=100               # Maximum database connections
CONNECTION_TIMEOUT=30             # Database connection timeout

# Computer Vision Configuration
MODEL_PATH=/app/my_model.pt       # YOLOv8 model file path
CONFIDENCE_THRESHOLD=0.5          # Detection confidence threshold
CPU_THREADS=4                     # CPU threads for inference
```

### SSL Certificate Management
- **Automatic Generation**: Certificates auto-generate based on SERVER_IP
- **Self-signed Certificates**: Suitable for development and testing
- **Production Certificates**: Replace auto-generated certs with CA-signed certificates
- **Certificate Location**: `nginx/certs/` directory
- **Renewal**: Restart nginx-proxy service to regenerate certificates

---

## 🔒 Network & Security

### Security Architecture
- **SSL/TLS Encryption**: End-to-end encryption for all HTTPS traffic
- **Security Headers**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- **Input Validation**: Comprehensive Pydantic-based request validation
- **SQL Injection Prevention**: Parameterized queries and ORM protection
- **CORS Configuration**: Configurable cross-origin policies
- **Rate Limiting**: Nginx-based request throttling

### Network Isolation
```
🌍 Public Internet
        │
        ▼
🔀 Nginx Proxy (DMZ)
        │
        ▼  
🔒 Docker Network (Internal)
├── API Service      (No external ports)
├── Detector Service (No external ports)
└── Database         (No external ports)
```

### Database Security
- **User Isolation**: Dedicated database user with minimal privileges
- **Connection Encryption**: MySQL native password authentication
- **Backup Security**: Automated backup with data integrity verification
- **Access Control**: Network-level access restriction via Docker networks

---

## 📊 Performance & Monitoring

### System Performance Metrics
- **API Response Time**: Target <100ms for standard operations
- **Computer Vision Processing**: 200-500ms per image depending on size
- **Database Query Performance**: Optimized with indexes and connection pooling
- **Memory Usage**: ~2-3GB total for all services
- **CPU Usage**: Optimized for multi-core systems (4+ cores recommended)

### Health Monitoring
```bash
# System health check
curl http://localhost:8136/healthz

# Service-specific health
docker-compose ps                    # Container status
docker stats                        # Resource usage
docker-compose logs --tail 50 api   # Service logs
```

### Performance Optimization
- **Database Connection Pooling**: Managed connection lifecycle
- **API Response Caching**: Optional Redis-compatible caching
- **Image Processing Optimization**: CPU-optimized PyTorch inference
- **Nginx Caching**: Static content caching and compression

---

## 📚 Documentation Structure

### Service-Level Documentation
| Service | Primary README | Endpoint Reference | Live Documentation |
|---------|---------------|-------------------|-------------------|
| **API Service** | `services/api/README.md` | `services/api/api_endpoint.txt` | http://localhost:8136/docs |
| **Detector Service** | `services/detector/README.md` | `services/detector/detector_endpoint.txt` | http://localhost:8100/docs |
| **Shared Services** | `services/shared/README.md` | - | - |

### System-Level Documentation  
| Document | Purpose | Content |
|----------|---------|---------|
| **`how_to_run.txt`** | Deployment Guide | 6 deployment methods with detailed instructions |
| **`lib_requirement.txt`** | Dependency Reference | Complete library breakdown and installation guide |
| **`server_endpoint.txt`** | Complete API Map | All 37 endpoints across all services |

### Additional Resources
- **Database Schema**: `db/db_init/` directory contains complete schema files
- **Sample Data**: `db/db_insert/` directory contains sample data for testing
- **Nginx Configuration**: `nginx/` directory contains proxy configuration
- **Docker Configurations**: Multiple docker-compose files for different environments

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Port Conflicts
```bash
# Check port usage
netstat -an | findstr ":8136"
netstat -an | findstr ":8118"  
netstat -an | findstr ":8100"
netstat -an | findstr ":3308"

# Kill conflicting processes
npx kill-port 8136 8118 8100 3308  # Node.js tool
# OR manually find and kill processes
```

#### Database Connection Issues
```bash
# Test database connectivity
docker exec ass_server-db-1 mysqladmin ping -u eggien -p

# Check database logs
docker logs ass_server-db-1 --tail 50

# Reset database completely
.\docker.ps1 down
docker volume rm ass_server_mysql_data
.\docker.ps1 simple  # Restart with fresh database
```

#### SSL Certificate Problems
```bash
# Regenerate SSL certificates
docker-compose restart nginx-proxy

# Check certificate validity
docker exec ass_server-nginx-proxy-1 \
  openssl x509 -in /etc/nginx/certs/cert.pem -text -noout

# Manual certificate generation
docker exec ass_server-nginx-proxy-1 /etc/nginx/generate-ssl.sh
```

#### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check service health
curl http://localhost:8136/healthz
curl http://localhost:8100/healthz

# View detailed logs
docker-compose logs -f --tail 100
```

---

## 💻 Development Workflow

### Local Development Setup
```bash
# Clone and setup
git clone <repository-url>
cd ASS_server

# Environment configuration
cp .env.example .env
# Edit .env with your IP address

# Start development environment
.\docker.ps1 simple

# Verify services
curl http://localhost:8136/healthz  # API health
curl http://localhost:8100/healthz  # Detector health
```

### Development Tools
- **API Testing**: Use `http://localhost:8136/docs` for interactive testing
- **Database Access**: Direct MySQL connection on port 3308
- **Log Monitoring**: Real-time log viewing with `docker-compose logs -f`
- **Hot Reload**: API service supports code hot reload in development mode

### Testing Strategy
```bash
# API endpoint testing
curl -X GET "http://localhost:8136/products" \
  -H "accept: application/json"

# Computer vision testing  
curl -X POST "http://localhost:8100/api/v1/image" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_image.jpg"

# Database testing
docker exec -it ass_server-db-1 mysql -u eggien -p \
  iotc25_advanced_support_squad -e "SELECT COUNT(*) FROM product_master;"
```

---

**Last Updated**: September 13, 2025  
**Version**: 2.1 - Complete architecture documentation  
**Team**: Advanced Support Squad  
**Competition**: IoT Challenge 2025 "Edge AI for smart retail"  
**Organizers**: FPT Software & Silicon Labs  

For detailed service-specific information, please refer to individual service documentation in their respective directories.
