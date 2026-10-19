# Smart Shopping Cart System - IoT Challenge 2025

**Team: Advanced Support Squad** (5 members)  
**Organization: FPT Software & Silicon Labs**  
**Result: national final, Top 10 team**

An integrated Edge AI solution for smart retail featuring real-time computer vision, BLE-based indoor positioning, voice recognition, and intelligent cart management. This system demonstrates advanced IoT capabilities including YOLOv8 object detection, trilateration-based positioning, and seamless multi-platform integration for the IoT Challenge 2025 "Edge AI for Smart Retail" competition.

## Table of Contents

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Hardware Requirements](#hardware-requirements)
- [Hardware Setup](#hardware-setup)
- [Build Environment Setup](#build-environment-setup)
  - [Windows](#windows)
- [Debug Environment](#debug-environment)
- [Project Structure](#project-structure)
- [Quick Start Guide](#quick-start-guide)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

The **Smart Shopping Cart System** is a comprehensive IoT solution that transforms traditional retail shopping carts into intelligent, connected devices. The system integrates three major components:

1. **Embedded Firmware** (Silicon Labs EFR32/BGM): BLE-enabled smart cart with real-time positioning, voice recognition, and sensor integration
2. **Backend Server Platform** (Docker/Python): Microservices architecture with FastAPI, YOLOv8 object detection, and MySQL database
3. **Gateway & Frontend** (Raspberry Pi 4 + Home Assistant): Edge AI gateway with custom dashboards for real-time monitoring and management

### Key Features

- **Real-time Indoor Positioning**: BLE beacon-based trilateration with 4-anchor system for accurate cart tracking
- **Computer Vision AI**: YOLOv8 object detection for automated inventory recognition and cart content verification
- **Voice Command Integration**: Push-to-talk voice recognition for hands-free cart operation
- **Multi-sensor Fusion**: IMU (accelerometer), PIR motion sensor, and camera integration for enhanced cart state detection
- **REST & WebSocket APIs**: 29 REST endpoints and 5 WebSocket channels for comprehensive system control
- **Scalable Microservices**: Dockerized backend with Nginx reverse proxy, SSL/TLS security, and production-ready deployment
- **Custom Dashboard**: Home Assistant-based gateway with real-time cart monitoring and management interface

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Firmware** | Silicon Labs Bluetooth SDK v3.x, C | Embedded BLE application with sensor integration |
| **Backend Server** | Python 3.11+, FastAPI, Docker | Microservices API and computer vision processing |
| **Computer Vision** | YOLOv8 (Ultralytics), PyTorch | Real-time object detection and classification |
| **Database** | MySQL 8.0 | Product catalog, cart inventory, and beacon mapping |
| **Gateway** | Raspberry Pi 4, Home Assistant | Edge gateway with custom frontend dashboards |
| **Reverse Proxy** | Nginx | SSL termination, load balancing, and security |
| **Positioning** | BLE Beacons, RSSI-based Trilateration | Indoor location tracking with 4-anchor system |

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Smart Shopping Cart System                           │
│                         System Architecture                             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  HARDWARE LAYER (Smart Shopping Cart)                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Silicon Labs EFR32/BGM (BLE SoC)                                        │
│  ├── Bluetooth LE Stack (Central + Peripheral)                          │
│  ├── GATT Services:                                                      │
│  │   ├── cart_position     (Real-time X,Y coordinates)                  │
│  │   ├── anchor_position   (Fixed beacon locations)                     │
│  │   ├── cart_state        (Movement, PIR, camera status)               │
│  │   └── cart_voice_cmd    (Voice command results)                      │
│  ├── BLE Scanner (RSSI from 4 beacons)                                  │
│  ├── Trilateration Engine (Indoor positioning)                          │
│  ├── Peripheral Handlers:                                               │
│  │   ├── IMU (Accelerometer/Gyroscope)                                  │
│  │   ├── PIR Motion Sensor                                              │
│  │   ├── Camera State Monitor                                           │
│  │   └── Button Interface                                               │
│  ├── Voice Detection Module (Push-to-Talk)                              │
│  └── ESP32 UART Interface (Gateway communication)                       │
│                                                                           │
│  4x BLE Beacons (Fixed Positions)                                       │
│  ├── Beacon 0: (0.0, 0.0)     - Southwest corner                        │
│  ├── Beacon 1: (0.0, 10.0)    - Northwest corner                        │
│  ├── Beacon 2: (3.6, 10.0)    - Northeast corner                        │
│  └── Beacon 3: (3.6, 0.0)     - Southeast corner                        │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                            BLE Connection
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│  EDGE GATEWAY LAYER (Raspberry Pi 4)                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Home Assistant OS                                                       │
│  ├── Custom Frontend Dashboards:                                        │
│  │   ├── Cart Management Dashboard (Real-time monitoring)               │
│  │   └── Admin Configuration Dashboard (System settings)                │
│  ├── Custom Lovelace Cards:                                             │
│  │   ├── admin-cart-config-card.js                                      │
│  │   ├── general-search-card.js                                         │
│  │   └── Additional UI components                                       │
│  ├── BLE Integration (Cart communication)                               │
│  ├── HTTP/WebSocket Client (Backend API)                                │
│  └── Automation & Event Handling                                        │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                      HTTP/WebSocket (Port 8118/8136)
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│  BACKEND SERVER LAYER (Docker Containers)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Nginx Reverse Proxy                                                    │
│  ├── HTTPS/WSS (Port 8118) - Production with SSL/TLS                    │
│  ├── HTTP/WS (Port 8136) - Development mode                             │
│  ├── SSL Certificate Management                                         │
│  ├── Load Balancing & Security Headers                                  │
│  └── WebSocket Proxy & Upgrade Handling                                 │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ API Service (FastAPI - Port 8136)                               │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ REST Endpoints (29 total):                                      │   │
│  │ ├── Cart Management (6 endpoints)                               │   │
│  │ │   ├── GET/POST/PUT/DELETE cart operations                     │   │
│  │ │   ├── Cart inventory updates (merge/add/remove modes)         │   │
│  │ │   └── Cart state synchronization                              │   │
│  │ ├── Product Catalog (8 endpoints)                               │   │
│  │ │   ├── Product CRUD operations                                 │   │
│  │ │   ├── Product search & filtering                              │   │
│  │ │   └── Inventory management                                    │   │
│  │ ├── Map & Beacon Management (10 endpoints)                      │   │
│  │ │   ├── Store layout mapping                                    │   │
│  │ │   ├── Beacon position configuration                           │   │
│  │ │   └── Indoor positioning data                                 │   │
│  │ └── Analytics & Reporting (5 endpoints)                         │   │
│  │                                                                  │   │
│  │ WebSocket Channels (5 streams):                                 │   │
│  │ ├── /ws/cart_position - Real-time position updates             │   │
│  │ ├── /ws/cart_state - Cart status streaming                     │   │
│  │ ├── /ws/inventory - Live inventory changes                     │   │
│  │ ├── /ws/detection - Computer vision results                    │   │
│  │ └── /ws/system - System health monitoring                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Detector Service (YOLOv8 - Port 8100)                          │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ ├── Image Processing Pipeline (OpenCV)                          │   │
│  │ ├── YOLOv8 Object Detection Engine                             │   │
│  │ ├── Product Recognition & Classification                        │   │
│  │ ├── Inventory Counting & Verification                          │   │
│  │ ├── Detection Frame Storage & Logging                          │   │
│  │ └── Real-time Vision Processing (CPU-optimized)                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  Shared Services Layer                                                  │
│  ├── Database Access Layer (PyMySQL)                                    │
│  ├── Repository Pattern (Data abstraction)                              │
│  ├── Business Logic Services                                            │
│  └── Configuration Management                                           │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                            MySQL Connection
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│  DATA PERSISTENCE LAYER                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  MySQL Database (Port 3308/3306)                                        │
│  ├── product_master     (Product catalog with images & prices)          │
│  ├── cart_items         (Shopping cart inventory tracking)              │
│  ├── cart_config        (Cart configuration & settings)                 │
│  ├── map_beacon         (BLE beacon positions & MAC addresses)          │
│  └── map                (Store layout & zone mapping)                   │
│                                                                           │
│  File Storage System                                                    │
│  ├── storage/cam_detect/  (Camera cart images)                          │
│  ├── storage/frames/      (Detection frames & video)                    │
│  ├── models/              (AI model files - YOLOv8)                     │
│  └── logs/                (Service logs - API & Detector)               │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Cart Positioning**: BLE beacons broadcast signals → Cart firmware reads RSSI → Trilateration algorithm calculates (X,Y) → Position sent via BLE GATT notification → Gateway receives → Backend stores & broadcasts via WebSocket
2. **Computer Vision**: Camera captures image → Sent to Detector Service → YOLOv8 processes image → Detected products matched with database → Inventory updated → Results sent via WebSocket
3. **Voice Commands**: Push-to-talk button pressed → Voice recorded → AI processes command → Command result sent via GATT → Gateway triggers action → Backend updated
4. **Inventory Management**: Products added/removed → Detector verifies → API updates cart_items table → WebSocket notifies connected clients → Dashboard reflects changes

## Hardware Requirements

### Smart Shopping Cart (Firmware)

1. **Silicon Labs Development Kit**
   - **EFR32BG22** or **BGM220** Bluetooth SoC module
   - Bluetooth LE 5.2+ with 2.4 GHz radio
   - Minimum 512 KB Flash, 32 KB RAM
   - ARM Cortex-M33 processor

2. **BLE Beacon System** (4 units required)
   - BLE beacon devices (Nordic nRF51/52 or compatible)
   - Fixed MAC addresses as defined in `config.h`:
     - Beacon 0: `DA:7E:67:18:2E:C8`
     - Beacon 1: `7E:7A:AD:DA:F3:80`
     - Beacon 2: `16:07:62:DA:F3:80`
     - Beacon 3: `4A:C9:62:DA:F3:80`
   - Mounted at corners of store layout (3.6m x 10.0m area)

3. **Sensors & Peripherals**
   - **IMU Module**: Accelerometer + Gyroscope (I2C interface)
   - **PIR Motion Sensor**: Digital output for motion detection
   - **Camera Module**: For product capture (connected via ESP32)
   - **Push-to-Talk Button**: For voice command activation
   - **Status LEDs**: Visual indicators for cart state

4. **Communication Module**
   - **ESP32**: UART bridge for camera and gateway communication
   - USB-to-Serial adapter for firmware debugging

### Backend Server

1. **Server Hardware** (Minimum Specifications)
   - **CPU**: Intel Core i5 / AMD Ryzen 5 or equivalent (4+ cores)
   - **RAM**: 8 GB (16 GB recommended for optimal performance)
   - **Storage**: 50 GB available space (SSD recommended)
   - **Network**: Gigabit Ethernet connection

2. **Software Requirements**
   - **Operating System**: Windows 10/11 (64-bit)
   - **Docker Desktop**: Version 4.0+ with Docker Compose
   - **Python**: 3.11+ (for local development)
   - **MySQL Client**: Optional for database management

### Gateway & Frontend

1. **Raspberry Pi 4**
   - **Model**: Raspberry Pi 4 Model B
   - **RAM**: 2 GB minimum (4 GB or 8 GB recommended)
   - **Storage**: microSD card 16 GB+ (Class 10 or UHS-I)
   - **Power Supply**: Official 5V 3A USB-C power adapter
   - **Network**: Ethernet connection or Wi-Fi 802.11ac

2. **Accessories**
   - microSD card reader (for flashing Home Assistant OS)
   - HDMI cable and monitor (for initial setup only)
   - Keyboard and mouse (for initial setup only)

### Network Infrastructure

- **Local Network**: Gigabit Ethernet switch or Wi-Fi access point
- **IP Address Management**: Static IPs recommended for backend server and gateway
- **Firewall Configuration**: Ports 8118 (HTTPS), 8136 (HTTP), 8123 (Home Assistant), 3308 (MySQL)

## Hardware Setup

### System Block Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                      SMART SHOPPING CART                          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Silicon Labs EFR32/BGM Module (Main Controller)        │    │
│  │                                                          │    │
│  │  ┌────────────────┐        ┌──────────────────┐        │    │
│  │  │  BLE Stack     │        │  Application     │        │    │
│  │  │                │◄──────►│                  │        │    │
│  │  │  - Central     │        │  - Positioning   │        │    │
│  │  │  - Peripheral  │        │  - Sensors       │        │    │
│  │  │  - GATT Server │        │  - Voice         │        │    │
│  │  └────────────────┘        └──────────────────┘        │    │
│  │                                                          │    │
│  │         GPIO/I2C/UART Interfaces                        │    │
│  └─────────────────────┬───┬───┬────┬─────────────────────┘    │
│                        │   │   │    │                           │
│    ┌───────────────────┘   │   │    └──────────────────┐       │
│    │                       │   │                        │       │
│    v                       v   v                        v       │
│  ┌────────┐          ┌─────────────┐              ┌─────────┐  │
│  │  IMU   │          │    PIR      │              │ Button  │  │
│  │ Sensor │          │   Sensor    │              │  Input  │  │
│  └────────┘          └─────────────┘              └─────────┘  │
│   (I2C)                 (GPIO)                       (GPIO)     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              ESP32 UART Bridge                           │  │
│  │  ┌────────────┐          ┌──────────────────┐           │  │
│  │  │   Camera   │◄────────►│  WiFi/BLE Bridge │           │  │
│  │  │   Module   │          │                  │           │  │
│  │  └────────────┘          └──────────────────┘           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                          UART Connection                        │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                          BLE Connection
                               │
                               v
                    ┌──────────────────────┐
                    │  BLE Beacon System   │
                    │                      │
                    │  Beacon 0 (0.0, 0.0) │ ◄─┐
                    │  Beacon 1 (0.0, 10.0)│   │ RSSI
                    │  Beacon 2 (3.6, 10.0)│   │ Broadcasting
                    │  Beacon 3 (3.6, 0.0) │ ◄─┘
                    └──────────────────────┘
                               │
                          BLE Connection
                               │
                               v
┌───────────────────────────────────────────────────────────────────┐
│                    RASPBERRY PI 4 GATEWAY                         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │            Home Assistant OS                            │    │
│  │                                                          │    │
│  │  ┌──────────────┐     ┌───────────────────────┐        │    │
│  │  │ BLE Integration│◄──►│  Custom Dashboards   │        │    │
│  │  │                │     │  - Cart Monitor      │        │    │
│  │  │ - Cart Comm    │     │  - Admin Config     │        │    │
│  │  │ - Data Relay   │     │  - Real-time View   │        │    │
│  │  └────────┬───────┘     └───────────────────────┘        │    │
│  │           │                                               │    │
│  │           │  ┌─────────────────────────────────┐         │    │
│  │           └─►│  HTTP/WebSocket Client          │         │    │
│  │              │  - API Communication            │         │    │
│  │              │  - Real-time Updates            │         │    │
│  │              └─────────────────┬───────────────┘         │    │
│  └────────────────────────────────┼─────────────────────────┘    │
│                                   │                               │
│                         Ethernet / WiFi                           │
└───────────────────────────────────┼───────────────────────────────┘
                                    │
                    HTTP/HTTPS (Port 8118/8136)
                    WebSocket (Real-time Data)
                                    │
                                    v
┌───────────────────────────────────────────────────────────────────┐
│                   BACKEND SERVER (Docker Host)                    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Nginx Reverse Proxy                        │    │
│  │  - SSL/TLS Termination                                  │    │
│  │  - Load Balancing                                       │    │
│  │  - Security Headers                                     │    │
│  └────────────────┬────────────────────────────────────────┘    │
│                   │                                              │
│       ┌───────────┴───────────┐                                 │
│       │                       │                                 │
│       v                       v                                 │
│  ┌─────────────────┐   ┌──────────────────┐                    │
│  │  API Service    │   │ Detector Service │                    │
│  │  (FastAPI)      │   │  (YOLOv8 CV)     │                    │
│  │                 │   │                  │                    │
│  │  - REST APIs    │   │  - Image Process │                    │
│  │  - WebSocket    │◄─►│  - Detection     │                    │
│  │  - Business     │   │  - Classification│                    │
│  │    Logic        │   │  - Inventory     │                    │
│  └────────┬────────┘   └──────────────────┘                    │
│           │                                                      │
│           │   ┌───────────────────────────────┐                │
│           └──►│   Shared Services Layer       │                │
│               │  - Database Access (PyMySQL)  │                │
│               │  - Repository Pattern         │                │
│               │  - Business Services          │                │
│               └────────────┬──────────────────┘                │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                    MySQL Protocol (Port 3308)
                             │
                             v
                    ┌─────────────────┐
                    │  MySQL Database │
                    │                 │
                    │  - Products     │
                    │  - Carts        │
                    │  - Beacons      │
                    │  - Maps         │
                    └─────────────────┘
```

### Physical Setup Instructions

1. **BLE Beacon Placement**
   - Mount 4 BLE beacons at corners of retail area
   - Beacon positions (in meters):
     - Beacon 0: Southwest corner (0.0, 0.0)
     - Beacon 1: Northwest corner (0.0, 10.0)
     - Beacon 2: Northeast corner (3.6, 10.0)
     - Beacon 3: Southeast corner (3.6, 0.0)
   - Ensure beacons are at consistent height (1.5m - 2.0m recommended)
   - Verify MAC addresses match configuration in `config.h`

2. **Smart Cart Assembly**
   - Mount Silicon Labs module on shopping cart frame
   - Connect IMU sensor via I2C bus
   - Wire PIR sensor to GPIO pin
   - Install push-to-talk button on cart handle
   - Connect ESP32 via UART for camera communication
   - Attach USB power bank for mobile power supply

3. **Raspberry Pi 4 Gateway Setup**
   - Install Raspberry Pi 4 in central location
   - Connect to network via Ethernet (recommended) or WiFi
   - Ensure line-of-sight to cart (within BLE range)
   - Power via official USB-C adapter

4. **Backend Server Setup**
   - Connect server to local network via Ethernet
   - Configure static IP address for consistent access
   - Ensure firewall allows required ports
   - Connect to same network as gateway

## Build Environment Setup

### Windows

This project is optimized for Windows development. Follow the steps below to set up your complete development environment.

#### Prerequisites

Administrative privileges on Windows 10/11 (64-bit)

#### 1. Firmware Development Environment (Silicon Labs)

**Install Simplicity Studio 5**

1. Download from [Silicon Labs Simplicity Studio](https://www.silabs.com/developers/simplicity-studio)
2. Run installer and select:
   - Gecko SDK Suite (GSDK) 4.4.0+
   - Bluetooth SDK v3.x
   - GNU ARM Toolchain
3. Register with Silicon Labs account

**Install SEGGER J-Link Drivers**

1. Download [SEGGER J-Link Software](https://www.segger.com/downloads/jlink/)
2. Install J-Link Software Pack for Windows (64-bit)
3. Restart computer

**Set Up Development Kit**

1. Connect EFR32/BGM board via USB
2. Open Simplicity Studio 5
3. Verify device in **Tools** → **Simplicity Commander**
4. Flash bootloader:
   - **File** → **New** → **Silicon Labs Project Wizard**
   - Select device → **Bluetooth Apploader OTA DFU**
   - Build and flash

**Import Firmware Project**

```
File → Import → General → Existing Projects into Workspace
Browse to: projects/firmware/Advanced_Support_Squad
Click Finish
```

**Build and Flash**

1. Right-click project → **Build Project**
2. Right-click project → **Run As** → **Silicon Labs ARM Program**
3. Monitor Console for "System started" message

For detailed firmware development guide, see [projects/firmware/Advanced_Support_Squad/readme.md](projects/firmware/Advanced_Support_Squad/readme.md)

#### 2. Backend Server Environment

**Install Docker Desktop**

1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. Install with WSL 2 backend
3. Restart computer
4. Verify Docker is running (check system tray)

**Install Python 3.11+ (Optional)**

```powershell
# Download from https://www.python.org/downloads/
# During installation, check "Add Python to PATH"

# Verify installation
python --version
pip --version
```

**Navigate to Backend Directory**

```powershell
cd projects\backend
```

**Configure Environment Variables**

Passwords are not stored in the repository. Copy the template in `projects/backend/` and set your own values (`.env` is git-ignored):

```powershell
copy .env.example .env
# then edit MYSQL_ROOT_PASSWORD and MYSQL_PASSWORD in .env
```

`docker-compose.yaml` reads these two values and stops with a clear message if they are missing. The database name (`iotc25_advanced_support_squad`), the database user (`eggien`) and the ports (MySQL 3308, API over HTTP 8136, HTTPS 8118, detector 8100) are set in the compose files. The HTTPS certificate is self-signed and generated at start-up by `nginx/generate-ssl.sh` for `SERVER_IP`.

**Build and Start Services**

```powershell
# Development mode (HTTP only)
docker-compose -f docker-compose.simple.yaml build
docker-compose -f docker-compose.simple.yaml up -d

# Production mode (with Nginx SSL)
docker-compose -f docker-compose.yaml up -d
```

**Verify Services**

```powershell
# Check running containers
docker ps

# Test API endpoint
curl http://localhost:8136/health

# Access API documentation
# Open browser: http://localhost:8136/docs
```

**PowerShell Management Script**

```powershell
# Use docker.ps1 for easy management
.\docker.ps1 start    # Start all services
.\docker.ps1 stop     # Stop all services
.\docker.ps1 logs     # View all logs
.\docker.ps1 logs api # View API logs only
.\docker.ps1 status   # Check service status
```

For detailed backend setup guide, see [projects/backend/READ_ME_sv.md](projects/backend/READ_ME_sv.md)

#### 3. Gateway & Frontend Environment (Raspberry Pi 4)

**Download Home Assistant OS**

1. Visit [Home Assistant Installation](https://www.home-assistant.io/installation/raspberrypi)
2. Download latest image for Raspberry Pi 4

**Flash OS to microSD Card**

1. Download [Balena Etcher](https://www.balena.io/etcher/)
2. Flash Home Assistant image to microSD card (16GB+)
3. Insert card into Raspberry Pi 4
4. Connect power and network (Ethernet recommended)
5. Wait 10-20 minutes for first boot

**Access Home Assistant**

- Browser: `http://homeassistant.local:8123`
- Or: `http://<raspberry_pi_ip>:8123`
- Create admin account

**Deploy Custom Configuration**

```powershell
# From Windows, copy configuration to Raspberry Pi
# Using Samba share: \\homeassistant.local\config
# Or via SCP (if SSH add-on enabled):
scp -r projects\gateway\Config\* root@homeassistant.local:/config/
```

**Add Custom Resources**

1. **Settings** → **Dashboards** → **Resources**
2. Add each JS file from `www/`:
   - URL: `/local/admin-cart-config-card.js`
   - Type: **JavaScript Module**
3. Repeat for all custom cards

**Import Dashboards**

1. **Settings** → **Dashboards** → **Add Dashboard**
2. Open in edit mode → **Raw configuration editor**
3. Copy content from `Dashboard_manage/cart142dashboard.yaml`
4. Paste and save

**Restart Home Assistant**

- **Settings** → **System** → **Restart**

For detailed gateway setup guide, see [projects/gateway/READ_ME_gw.md](projects/gateway/READ_ME_gw.md)

## Debug Environment

### Firmware Debugging (Simplicity Studio)

**Connect Debug Probe**
- Connect Silicon Labs board via USB
- Verify in Simplicity Commander

**Start Debug Session**
```
Right-click project → Debug As → Silicon Labs ARM Program
```

**Debug Features**
- **Breakpoints**: Click editor left margin
- **Step Controls**: Step Over/Into/Out toolbar buttons
- **Variables**: Real-time inspection
- **Console Output**: UART at 115200 baud

**UART Console Monitoring**
```
Tools → Simplicity Commander → Console
Configure: 115200, 8N1
View printf() output
```

**Network Analyzer** (BLE)
```
Tools → Network Analyzer
Capture BLE advertising, connections, GATT operations
Analyze RSSI values from beacons
```

**Energy Profiler**
```
Tools → Energy Profiler
Monitor current consumption
Identify power-hungry code
```

### Backend Service Debugging

**View Service Logs**

```powershell
# All services
docker-compose -f docker-compose.simple.yaml logs -f

# Specific service
docker logs -f api_service
docker logs -f detector_service
```

**Access Container Shell**

```powershell
# API service
docker exec -it api_service /bin/bash

# MySQL
docker exec -it mysql_container mysql -uroot -p
```

**API Testing**

- **Swagger UI**: `http://localhost:8136/docs`
- Interactive API testing
- View request/response schemas

**Test Endpoints**

```powershell
# Health check
curl http://localhost:8136/health

# Get cart items
curl http://localhost:8136/api/v1/cart/142/items

# WebSocket connection (using websocat or browser)
websocat ws://localhost:8136/ws/cart_position
```

**Database Debugging**

```powershell
# Connect to MySQL
docker exec -it mysql_container mysql -usmartcart_user -p smartcart_db

# View tables
SHOW TABLES;

# Query cart items
SELECT * FROM cart_items WHERE cart_id = 142;

# Check beacon positions
SELECT * FROM map_beacon;
```

**Computer Vision Debugging**

- Detection frames saved to `storage/frames/`
- Review images with bounding boxes
- Check YOLO confidence scores in logs

```powershell
docker logs -f detector_service
```

### Gateway Debugging (Home Assistant)

**System Logs**

- UI: **Settings** → **System** → **Logs**
- Filter by integration or component

**SSH Access** (if enabled)

```powershell
ssh root@homeassistant.local
cat /config/home-assistant.log
ha core check
ha core restart
```

**Developer Tools**

- **Settings** → **Developer Tools**
- **States**: View/modify entity states
- **Services**: Manually call services
- **Events**: Monitor event bus
- **Templates**: Test Jinja2 templates

**Custom Card Debugging**

- Open browser Developer Console (F12)
- Check JavaScript errors
- Inspect network requests
- Verify resource loading

**BLE Integration Debugging**

```bash
# On Raspberry Pi
hcitool dev
bluetoothctl
# View BLE scan results in logs
```

## Project Structure

```
icc-25-advanced-support-squad-main/
│
├── projects/
│   ├── firmware/              # Embedded firmware for smart shopping cart
│   │   └── Advanced_Support_Squad/
│   │       ├── main.c         # Application entry point
│   │       ├── app.c          # Core application logic and BLE event handlers
│   │       ├── app.h          # Application interface definitions
│   │       ├── config.h       # System configuration (beacons, positioning)
│   │       ├── app_btn.c/.h   # Button handling and LED control
│   │       ├── Mylib/         # Custom libraries (voice push-to-talk)
│   │       ├── Peripheral/    # Peripheral drivers (IMU, PIR, camera)
│   │       ├── Target_tracking/ # Positioning and trilateration algorithms
│   │       ├── UART_ESP32/    # ESP32 communication module
│   │       ├── voice_detect/  # Voice recognition module
│   │       ├── aiml_2.0.1/    # AI/ML libraries
│   │       ├── autogen/       # Silicon Labs auto-generated files
│   │       ├── config/        # Bluetooth configuration files
│   │       └── simplicity_sdk_2024.12.2/ # Silicon Labs SDK
│   │
│   ├── backend/               # Backend server platform
│   │   ├── docker-compose.yaml          # Production deployment
│   │   ├── docker-compose.simple.yaml   # Development deployment
│   │   ├── docker.ps1                   # PowerShell management script
│   │   ├── how_to_run.txt               # Quick start guide
│   │   ├── lib_requirement.txt          # Python dependencies
│   │   ├── server_endpoint.txt          # API endpoint reference
│   │   ├── READ_ME_sv.md                # Detailed documentation
│   │   ├── db/                # Database scripts
│   │   │   ├── db_init/       # Schema initialization
│   │   │   └── db_insert/     # Sample data
│   │   ├── nginx/             # Reverse proxy configuration
│   │   │   ├── nginx.conf     
│   │   │   ├── generate-ssl.sh
│   │   │   └── certs/
│   │   ├── services/          # Microservices source code
│   │   │   ├── api/           # FastAPI service
│   │   │   │   ├── server.py
│   │   │   │   ├── requirements.txt
│   │   │   │   └── schemas/
│   │   │   ├── detector/      # Computer vision service
│   │   │   │   ├── app.py
│   │   │   │   ├── object_detect.py
│   │   │   │   └── requirements.txt
│   │   │   └── shared/        # Shared services
│   │   │       ├── db.py
│   │   │       ├── repos.py
│   │   │       ├── services.py
│   │   │       └── settings.py
│   │   ├── logs/              # Service logs
│   │   ├── models/            # AI models (YOLOv8)
│   │   ├── storage/           # Image storage
│   │   └── my_model.pt        # Main YOLOv8 model
│   │
│   └── gateway/               # Raspberry Pi 4 gateway
│       ├── READ_ME_gw.md      # Setup guide
│       ├── Config/            # Home Assistant configuration
│       │   ├── configuration.yaml
│       │   ├── automations.yaml
│       │   ├── custom_components/
│       │   └── www/           # Custom Lovelace cards
│       │       ├── admin-cart-config-card.js
│       │       └── general-search-card.js
│       └── Dashboard_manage/  # Dashboard configurations
│           ├── cart142dashboard.yaml
│           └── managerdashboard.yaml
│
├── resources/                 # Project resources
├── .github/                   # GitHub configuration
│   ├── workflows/             # CI/CD workflows
│   ├── CONTRIBUTING.md        
│   └── CODEOWNERS
├── .gitignore
├── Dockerfile
├── Makefile
├── README.md                  # This file
├── LICENSE.txt                # Apache 2.0 License
├── CLA.md
└── CODE_OF_CONDUCT.md
```

## Quick Start Guide

### 1. Flash Firmware to Smart Cart

```powershell
# Open Simplicity Studio 5
# Import project: projects/firmware/Advanced_Support_Squad
# Build and flash to EFR32/BGM board
# Monitor Console for "System started"
```

### 2. Deploy Backend Server

```powershell
cd projects\backend

# Configure environment (passwords are not in the repository)
copy .env.example .env   # set MYSQL_ROOT_PASSWORD and MYSQL_PASSWORD

# Start services (development mode)
docker-compose -f docker-compose.simple.yaml up -d

# Verify
curl http://localhost:8136/health
# Open http://localhost:8136/docs for API documentation
```

### 3. Set Up Gateway

```powershell
# Flash Home Assistant OS to Raspberry Pi 4 microSD
# Boot Pi and access http://homeassistant.local:8123
# Copy projects/gateway/Config/* to /config/
# Add custom resources: Settings → Dashboards → Resources
# Import dashboards from Dashboard_manage/
# Restart Home Assistant
```

### 4. Verify System Operation

1. **Check Firmware**: Monitor UART output for position data
2. **Check Backend**: API docs at `http://localhost:8136/docs`
3. **Check Gateway**: Home Assistant dashboard shows cart status
4. **Test Positioning**: Move cart, verify position updates
5. **Test Computer Vision**: Upload image to detector service
6. **Test WebSocket**: Connect to `ws://localhost:8136/ws/cart_position`

## Contributing

Please follow the [CONTRIBUTING](./.github/CONTRIBUTING.md) guideline.

All contributions must:
- Include the Apache 2.0 license header in source files
- Follow the coding standards for each component
- Pass all CI/CD checks
- Include appropriate documentation updates

## License

See the [LICENSE.txt](./LICENSE.txt) file for details.

This project is licensed under the Apache License 2.0.

Source code header format:

```c
/***************************************************************************//**
 *Licensed to the Apache Software Foundation (ASF) under one
 *or more contributor license agreements.  See the NOTICE file
 *distributed with this work for additional information
 *regarding copyright ownership.  The ASF licenses this file
 *to you under the Apache License, Version 2.0 (the
 *"License"); you may not use this file except in compliance
 *with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *Unless required by applicable law or agreed to in writing,
 *software distributed under the License is distributed on an
 *"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *KIND, either express or implied.  See the License for the
 *specific language governing permissions and limitations
 *under the License.
 ******************************************************************************/
```
