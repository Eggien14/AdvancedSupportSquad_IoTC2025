# Database Schema Documentation

## Overview

This document describes the database schema for the Smart Shopping Cart System developed by Advanced Support Squad team for IoT Challenge 2025 "Edge AI for smart retail", co-organized by FPT Software and Silicon Labs. The database implements a comprehensive product management and cart tracking solution designed for IoT-enabled retail environments.

## Database Configuration

- **Database Engine**: MySQL 8.0
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci
- **Default Authentication**: mysql_native_password
- **Database Name**: `iotc25_advanced_support_squad`

## Schema Architecture

The database consists of five primary tables organized to support smart cart functionality, product inventory management, and spatial positioning systems.

### Core Tables

#### product_master
Primary product information repository containing comprehensive product data.

**Purpose**: Centralized product catalog with support for both unit-based and weight-based sales.

**Key Fields**:
- `product_id`: Auto-incrementing primary key
- `product_name`: Product identifier string
- `product_type`: Product category classification
- `area`: Storage location identifier
- `price`: Product pricing in decimal format
- `quantity`: Available inventory (supports decimal precision for weight-based items)
- `weight_kg`: Product weight specification (0.000 = unit-based sales, >0 = weight-based sales)
- `manufacturer`: Product manufacturer information
- `expiry_or_mfg_date`: Date field for expiration or manufacturing tracking
- `origin`: Product origin country or region

#### cart_items
Junction table linking cart instances with product inventories.

**Purpose**: Real-time cart contents tracking with quantity management.

**Key Fields**:
- `cart_id`: Cart identifier (BIGINT for scalability)
- `product_id`: Foreign key reference to product_master
- `quantity`: Product quantity in cart (decimal precision for weight-based items)

**Constraints**: 
- Composite primary key (cart_id, product_id)
- Foreign key constraint with CASCADE update and RESTRICT delete

#### cart_config
Cart hardware configuration and connectivity parameters.

**Purpose**: BLE communication and camera streaming configuration for individual carts.

**Key Fields**:
- `cart_id`: Primary cart identifier
- `cart_mac_address`: Physical MAC address for cart identification
- `cart_position`: BLE UUID for position tracking services
- `cart_state`: BLE UUID for cart state management
- `cart_voice_cmd`: BLE UUID for voice command functionality
- `cart_firmware_update`: BLE UUID for firmware update services
- `cam_stream_url`: Camera stream endpoint URL

#### map_beacon
Beacon positioning system configuration for indoor navigation.

**Purpose**: Spatial reference points for cart positioning and navigation within retail environment.

**Key Fields**:
- `map_id`: Map instance identifier
- `beacon_id`: Individual beacon identifier
- `beacon_mac_address`: Beacon hardware MAC address
- `beacon_x_coordinate`: X-axis position coordinate
- `beacon_y_coordinate`: Y-axis position coordinate
- `beacon_D0`: RSSI value at 1-meter distance (dBm)
- `beacon_n`: Environmental signal attenuation coefficient

#### map
Grid-based spatial mapping system.

**Purpose**: Discrete coordinate system for retail space representation and area classification.

**Key Fields**:
- `map_id`: Map instance identifier
- `x_coordinate`: Grid X position (integer)
- `y_coordinate`: Grid Y position (integer)
- `area`: Area classification or zone identifier

**Grid System**: Implements 10x10 coordinate system for spatial mapping.

## Data Initialization

The database includes comprehensive sample data initialization across all tables:

### Product Master Data
- **698 product entries** covering food and beverage categories
- Product types include: food, drink
- Area classifications: A1, A2, A3
- Price range: 4,500 - 50,000 VND
- Mixed unit-based and weight-based products

### Cart Configuration Data
- **Two configured carts**: Cart 142 and Cart 105
- Complete BLE UUID configuration for all services
- Camera streaming URLs configured
- MAC address assignments for hardware identification

### Sample Cart Contents
- **Cart 142**: 10 diverse products (mix of unit and weight-based items)
- **Cart 105**: 7 products with varied quantities
- Demonstrates both counting and weighing scenarios

### Positioning System Data
- **4 beacon configuration** for map_id 510
- Beacon coordinates covering 10x10 grid corners
- Standardized RSSI calibration (-60.0 dBm at 1m)
- Environmental coefficient of 1.8 for signal attenuation

### Spatial Mapping Data
- **100-coordinate grid system** (10x10)
- Area classifications: '1' (accessible), '0' (restricted), 'entrance'
- Complete coordinate coverage for map_id 510

## Performance Considerations

### Indexing Strategy
- `product_master`: Index on product_name for search optimization
- `cart_items`: Composite primary key enables efficient cart-product lookups
- `map_beacon`: Composite primary key supports spatial queries
- `map`: Composite primary key enables coordinate-based operations

### Data Integrity
- Foreign key constraints ensure referential integrity
- Decimal precision maintains accuracy for weight-based transactions
- Timestamp fields provide audit trail functionality
- Character set configuration supports international product names

## Schema Usage Patterns

### Product Management
- Support for both discrete unit sales and continuous weight-based sales
- Inventory tracking with decimal precision
- Multi-language product information support

### Cart Operations
- Real-time cart content modification
- BLE service discovery and connection management
- Camera stream integration for computer vision applications

### Spatial Positioning
- Beacon-based indoor positioning system
- Grid-based area management and navigation
- Signal strength calibration for distance estimation

## Integration Points

This database schema supports integration with:
- FastAPI REST services for cart and product management
- BLE communication protocols for cart hardware interaction
- Computer vision services for automated product detection
- Real-time streaming services for inventory updates
- Spatial positioning algorithms for cart tracking

## Deployment Notes

Database initialization occurs automatically through Docker Compose orchestration. SQL files execute in numerical order ensuring proper dependency resolution and data consistency.
