# API Service - Smart Shopping Cart System

## Overview

The API Service is the central REST API gateway for the Smart Shopping Cart System, designed for IoT Challenge 2025 "Edge AI for smart retail". This service provides comprehensive endpoints for product management, cart operations, spatial mapping, and real-time data streaming.

**Team**: Advanced Support Squad  
**Organized by**: FPT Software & Silicon Labs  
**Technology Stack**: FastAPI, MySQL, WebSocket, Docker

## Architecture

### Service Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Apps   │────│   API Service    │────│  Shared Layer   │
│                 │    │   (FastAPI)      │    │   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                       ┌──────────────────┐
                       │  Detector Service│
                       │    (YOLOv8)      │
                       └──────────────────┘
```

### Layer Structure
- **API Layer**: FastAPI endpoints with Pydantic schemas
- **Service Layer**: Business logic implementation  
- **Repository Layer**: Database access patterns
- **Shared Layer**: Common utilities and database connection

## Configuration

### Environment Variables
```bash
DB_HOST=db                                    # Database host
DB_PORT=3306                                  # Database port  
DB_USER=eggien                               # Database user
DB_PASSWORD=0363802865                       # Database password
DB_NAME=iotc25_advanced_support_squad        # Database name
API_PORT=8136                                # API service port
CACHE_ENABLED=true                           # Enable caching
UVICORN_WORKERS=2                            # Uvicorn worker count
```

### Docker Configuration
- **Port**: 8136 (HTTP API)
- **Base Image**: python:3.11-slim
- **Deployment**: Docker Compose with nginx proxy (production) or direct access (simple)

## API Endpoints

### Health Check
- `GET /healthz` - Service health status

### Product Management
- `GET /products/list-all-product` - List all products (ID + name only)
- `GET /products` - Search products with filters
- `GET /products/{product_id}` - Get detailed product information
- `GET /products/by-area/{area}` - Get products by area
- `GET /products/by-type/{product_type}` - Get products by type
- `POST /products/update-product/{product_id}` - Update product details
- `POST /products/delete-product/{product_id}` - Delete product

### Cart Inventory Management
- `POST /cart_inventory/{cart_id}/items` - Update cart items (replace/merge/delta modes)
- `GET /cart_inventory/{cart_id}` - Get cart details with total calculation

### Cart Configuration
- `GET /cart_infor/list-all-cart` - List all cart configurations
- `GET /cart_infor/{cart_id}` - Get specific cart configuration
- `POST /cart_infor/{cart_id}` - Update cart configuration
- `POST /cart_infor/delete-cart/{cart_id}` - Delete cart configuration

### Map Beacon Management
- `GET /map_beacon/{map_id}` - Get all beacons for a map
- `GET /map_beacon/{map_id}/{beacon_id}` - Get specific beacon configuration
- `POST /map_beacon/{map_id}/{beacon_id}` - Update beacon configuration
- `POST /map_beacon/delete-beacon/{map_id}/{beacon_id}` - Delete beacon
- `POST /map_beacon/delete-map/{map_id}` - Delete all beacons for map

### Map Management
- `GET /map/{map_id}` - Get all cells for a map
- `GET /map/{map_id}/{x_coor}/{y_coor}` - Get specific map cell
- `POST /map/{map_id}/{x_coor}/{y_coor}` - Update map cell
- `POST /map/delete-map/{map_id}` - Delete entire map
- `POST /map/map-upload/{map_id}` - Bulk update map cells

### Real-time Streaming
- `WebSocket /ws/cart_inventory/{cart_id}` - Real-time cart inventory updates
- `WebSocket /ws/product-detect/{cart_id}` - Real-time product detection stream
- `GET /stream` - HTTP streaming endpoint

## Data Models

### Product Schemas
- **Product**: Basic product information (ID, name, price, quantity, weight)
- **ProductDetail**: Complete product details with metadata
- **ProductListItem**: Product list view with area and type
- **ProductSimple**: Minimal product info (ID + name)
- **ProductUpdate**: Schema for product modifications

### Cart Inventory Schemas
- **CartUpsert**: Union type supporting three update modes:
  - **Replace**: Complete cart replacement
  - **Merge**: Partial cart update with absolute quantities
  - **Delta**: Incremental changes (add/remove items)
- **CartResponse**: Cart details with calculated totals
- **CartItem**: Individual cart item with product details

### Configuration Schemas
- **CartConfigRequest/Response**: Cart configuration management
- **MapBeaconRequest/Response**: Beacon positioning data
- **MapRequest/Response**: Map cell area assignments

## Business Logic

### Cart Update Modes

1. **Replace Mode**
   ```json
   {
     "mode": "replace",
     "items": [
       {"product_id": 1, "quantity": 2.5},
       {"product_id": 2, "quantity": 1.0}
     ]
   }
   ```

2. **Merge Mode**
   ```json
   {
     "mode": "merge", 
     "items": [
       {"product_id": 1, "quantity": 3.0}
     ]
   }
   ```

3. **Delta Mode**
   ```json
   {
     "mode": "delta",
     "changes": [
       {"product_id": 1, "delta": 1.0},
       {"product_id": 2, "delta": -0.5}
     ]
   }
   ```

### Product Search Features
- **By Name**: Fuzzy text search with LIKE patterns
- **By Area**: Filter products by store area/section
- **By Type**: Filter products by category/type
- **Pagination**: Configurable result limits

### Map System
- **Grid-based**: X/Y coordinate system for store layout
- **Beacon Integration**: BLE beacon positioning for cart tracking
- **Area Assignment**: Map cells assigned to store areas
- **Bulk Operations**: Efficient mass updates for map configuration

## Real-time Features

### WebSocket Streams
- **Cart Inventory Stream**: Live cart updates as items change
- **Product Detection Stream**: Real-time object detection from cart cameras
- **Change Detection**: Optimized streaming using signature-based change detection

### HTTP Streaming
- **MJPEG Stream**: Video stream from cart cameras
- **Low Latency**: Optimized for real-time monitoring

## Dependencies

### Core Dependencies
```
fastapi==0.116.1          # Web framework
uvicorn==0.35.0           # ASGI server
pydantic==2.11.7          # Data validation
pydantic-settings==2.6.1  # Settings management
pymysql==1.1.1            # MySQL connector
requests==2.31.0          # HTTP client
websockets==12.0          # WebSocket support
```

### Shared Layer Dependencies
- Database connection management
- Service layer business logic
- Repository pattern implementation
- Settings and configuration management

## Development

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn services.api.server:app --reload --host 0.0.0.0 --port 8136
```

### Docker Development
```bash
# Simple development setup
docker-compose -f docker-compose.simple.yaml up --build

# Production setup with nginx
docker-compose up --build
```

### Testing API
```bash
# Health check
curl http://localhost:8136/healthz

# List products
curl http://localhost:8136/products/list-all-product

# Get cart details
curl http://localhost:8136/cart_inventory/1
```

## Integration

### With Detector Service
- **Detection Results**: Receives object detection data from YOLOv8 service
- **Real-time Updates**: WebSocket streams for live detection feeds
- **Cart Synchronization**: Automatic inventory updates from camera detection

### With Database
- **Connection Pool**: Managed database connections via shared layer
- **Transaction Support**: Atomic operations for cart updates
- **Data Integrity**: Foreign key constraints and validation

### With Frontend
- **CORS Enabled**: Cross-origin requests supported
- **REST API**: Standard HTTP methods and status codes
- **WebSocket Support**: Real-time data streaming to web clients

## Monitoring

### Health Checks
- **Endpoint**: `/healthz` returns service status
- **Database**: Connection health validation
- **Dependencies**: Shared service availability

### Error Handling
- **HTTP Status Codes**: Standard REST API error responses
- **Validation Errors**: Detailed Pydantic validation messages
- **Database Errors**: Graceful handling of connection issues

## Security

### Data Validation
- **Pydantic Models**: Strict input validation and type checking
- **SQL Injection Prevention**: Parameterized queries via PyMySQL
- **Input Sanitization**: Automatic data cleaning and validation

### CORS Configuration
- **Origins**: Configurable allowed origins
- **Methods**: All HTTP methods supported
- **Headers**: Flexible header configuration for development

## Performance

### Optimization Features
- **Connection Pooling**: Efficient database connection management
- **Caching**: Optional caching layer for frequently accessed data
- **Async Processing**: Non-blocking I/O operations
- **Worker Scaling**: Multiple Uvicorn workers for concurrent requests

### WebSocket Optimization
- **Change Detection**: Signature-based change detection to minimize data transfer
- **Efficient Serialization**: Optimized JSON serialization for real-time streams
- **Connection Management**: Automatic reconnection and error handling

## Deployment

### Production Configuration
- **Nginx Proxy**: SSL termination and load balancing
- **Health Checks**: Docker health monitoring
- **Auto-restart**: Service resilience with restart policies
- **Logging**: Structured logging for monitoring and debugging

### Scaling Considerations
- **Horizontal Scaling**: Multiple API instances behind nginx
- **Database Optimization**: Connection pooling and query optimization
- **WebSocket Scaling**: Consider Redis for multi-instance WebSocket support

---

**Documentation Version**: 1.0.0  
**Last Updated**: September 13, 2025  
**Maintained by**: Advanced Support Squad
