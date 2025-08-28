# services/api - FastAPI REST API Service

##  MỤC ĐÍCH & CHỨC NĂNG

Service API này cung cấp REST endpoints cho:
- **Cart Management**: Quản lý giỏ hàng với 3 modes (replace/merge/delta) + auto inventory sync
- **Product Management**: CRUD operations cho sản phẩm với inventory tracking  
- **IoT Configuration**: Cấu hình BLE UUIDs cho cart IoT gateway
- **Beacon Positioning**: Quản lý beacon map cho indoor navigation system

##  CẤU TRÚC THƯ MỤC

```
services/api/
 server.py              #  FastAPI app khởi tạo + endpoint definitions
 schemas/               #  Pydantic schemas cho request/response
    __init__.py
    cart.py           # Cart-related schemas (CartResponse, CartItem, etc.)
    cart_inventory.py #  Inventory schemas (ReplaceUpsert, MergeUpsert, DeltaUpsert)
    product.py        # Product schemas (Product, ProductDetail, ProductType)
    cart_config.py    #  IoT cart configuration schemas
    map_beacon.py     #  Beacon positioning schemas
 Dockerfile            #  Container image definition
 requirements.txt      #  Python dependencies
 api_endpoint.txt      #  Chi tiết API documentation 
 READ_ME.MD           #  File này - API service documentation
```

##  CORE COMPONENTS

### **server.py** - FastAPI Application
```python
# Main FastAPI app với:
- CORS middleware (development)
- Exception handlers
- Health check endpoint
- All business endpoints
- Auto-generated OpenAPI docs (/docs)
```

### **schemas/** - Data Validation Layer
```python
# Pydantic V2 schemas với:
- Type safety và validation
- Discriminated unions cho cart operations
- Request/response models
- Auto JSON schema generation
```

### **Dependencies**
```python
# Service phụ thuộc vào:
services/shared/
 db.py          # Database connection (MySQL)
 repos.py       # Repository layer (data access)
 services.py    # Business logic layer
```

##  API ENDPOINTS SUMMARY

### **Health & Documentation**
```
GET  /healthz          # Service health check
GET  /docs             # Swagger UI documentation  
GET  /openapi.json     # OpenAPI specification
```

### **Cart Inventory Management** 
```
POST /cart_inventory/{cart_id}/items    # Universal cart update với inventory sync
GET  /cart_inventory/{cart_id}          # Get cart với product details + totals
```

### **Product & Warehouse**
```
GET  /products/{product_id}             # Product detail + inventory quantity
GET  /products?name={text}&limit={num}  # Search products by name
GET  /products/by-area/{area}?limit={}  # List products by warehouse area
GET  /products/by-type/{type}?limit={}  # List products by type
```

### **IoT Cart Configuration**   
```
GET  /cart_infor/{cart_id}              # Get BLE UUIDs + camera config
POST /cart_infor/{cart_id}              # Update cart IoT configuration
```

### **Beacon Positioning System** 
```
GET  /map_beacon/{map_id}               # Get all beacons in map
GET  /map_beacon/{map_id}/{beacon_id}   # Get specific beacon config
POST /map_beacon/{map_id}/{beacon_id}   # Update beacon (UPSERT)
```


##  PYDANTIC SCHEMAS

### **Cart Inventory Schemas** (cart_inventory.py)
```python
# Discriminated Union pattern cho type safety
class ReplaceUpsert(BaseModel):
    mode: Literal["replace"] = "replace"
    items: List[CartItem]

class MergeUpsert(BaseModel):  
    mode: Literal["merge"] = "merge"
    items: List[CartItem]

class DeltaUpsert(BaseModel):
    mode: Literal["delta"] = "delta" 
    changes: List[CartDelta]

# Union type với discriminator
CartInventoryRequest = Annotated[
    Union[ReplaceUpsert, MergeUpsert, DeltaUpsert],
    Field(discriminator='mode')
]
```

### **Product Schemas** (product.py)
```python
class Product(BaseModel):           # Basic product info
    product_id: int
    name: str
    price: Decimal
    quantity: int                   #  Inventory quantity

class ProductDetail(Product):       # Full product details
    type: str
    area: Optional[str]
    weight_kg: Optional[Decimal]
    manufacturer: Optional[str]
    # ... other fields

class ProductSimple(BaseModel):     # Simple list for dropdowns
    product_id: int                 
    name: str                       # Chỉ ID và name cho gọn

class ProductUpdate(BaseModel):     # Create/Update operations
    product_name: str               # Required field
    product_type: str               # Required field  
    price: Decimal                  # Required field >= 0
    quantity: int                   # Required field >= 0
    area: Optional[str]             # Optional fields
    weight_kg: Optional[Decimal]    # Can be null or empty string
    manufacturer: Optional[str]     # Empty strings → null
    # ... other optional fields
```

### **IoT Configuration** (cart_config.py)
```python
class CartConfig(BaseModel):
    cart_id: int
    cart_position: Optional[str]    # BLE UUID
    cart_state: Optional[str]       # BLE UUID  
    cart_voice_cmd: Optional[str]   # BLE UUID
    cart_ota: Optional[str]         # BLE UUID
    cam_stream_url: Optional[str]   # RTSP/HTTP URL
```

### **Beacon Positioning** (map_beacon.py)
```python
class MapBeacon(BaseModel):
    beacon_id: str
    beacon_blea_uuid: str
    beacon_x_coordinate: Decimal
    beacon_y_coordinate: Decimal  
    beacon_D0: Decimal             # RSSI at 1m
    beacon_n: Decimal              # Path loss exponent
```


##  BUSINESS LOGIC

### **Cart Inventory Management**
API tự động đồng bộ inventory khi thao tác cart:

**Replace Mode:**
1. Lấy cart hiện tại  tính delta với items mới
2. Trả inventory: `old_qty - new_qty` (nếu > 0)
3. Lấy inventory: `new_qty - old_qty` (nếu > 0)  
4. Thay thế toàn bộ cart

**Merge Mode:**
1. Cập nhật từng item riêng lẻ
2. Tính delta cho từng product: `old_cart_qty - new_cart_qty`
3. Cập nhật inventory tương ứng

**Delta Mode:**
1. `delta > 0`: Thêm vào cart, lấy từ kho
2. `delta < 0`: Bỏ khỏi cart, trả về kho (chỉ trả đúng số có)
3. Smart handling: Cart có 3, delta -5  trả về 3, cart = 0

**Auto Cleanup:** Xóa cart_items có quantity = 0

### **New Product Management APIs** (v2.1)

**GET /products/list-all-product:**
- Trả về tất cả sản phẩm với chỉ ID + name
- Không có pagination, tối ưu cho dropdown lists
- Response schema: `List[ProductSimple]`

**POST /products/update-product/{product_id}:**
- **UPSERT operation**: Tạo mới nếu ID chưa tồn tại, update nếu đã có
- **Smart validation**: Required fields (name, type, price, quantity)
- **Empty string handling**: Chuỗi rỗng `""` → `null` cho optional fields  
- **Response**: Full ProductDetail sau khi create/update

**POST /products/delete-product/{product_id}:**
- Xóa vĩnh viễn sản phẩm theo ID
- **Safety checks**: Kiểm tra tồn tại trước khi xóa
- **Confirmation response**: Trả về thông tin sản phẩm đã xóa

### **IoT Integration Features**
- BLE UUID configuration cho cart positioning
- Camera stream URL management  
- UPSERT operations (ON DUPLICATE KEY UPDATE)

### **Beacon Positioning System**
- Map-based beacon management
- RSSI calibration parameters (D0, n)
- Coordinate system support cho indoor navigation

##  DEPENDENCIES & INTEGRATION

### **External Dependencies** (requirements.txt)
```
fastapi>=0.110.0           # Web framework
uvicorn[standard]>=0.30.0  # ASGI server
pydantic>=2.8.0            # Data validation
PyMySQL>=1.1.0             # MySQL connector
python-multipart           # Form data support
```

### **Internal Dependencies**
```python
# Import từ shared modules:
from services.shared.db import get_connection
from services.shared.repos import (
    ProductRepo, CartRepo, 
    CartConfigRepo, MapBeaconRepo  # 
)
from services.shared.services import (
    ProductService, CartService,
    CartConfigService, MapBeaconService  #   
)
```

### **Database Integration**
- MySQL 8.0 với connection pooling
- Repository pattern cho data access
- Foreign key constraints cho data integrity
- Transaction support cho complex operations


##  DEVELOPMENT & DEPLOYMENT

### **Environment Variables**
```bash
# Required for database connection
MYSQL_HOST=mysql           # Container name hoặc IP
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root123
MYSQL_DATABASE=ass_main

# Optional API configuration  
API_HOST=0.0.0.0
API_PORT=8136
CORS_ORIGINS=*             # Development only
LOG_LEVEL=INFO
```

### **Docker Configuration**
```dockerfile
# Dockerfile highlights:
FROM python:3.11-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY services/api services/api
COPY services/shared services/shared
EXPOSE 8136
CMD ["uvicorn", "services.api.server:app", "--host", "0.0.0.0", "--port", "8136"]
```

### **Running the API Service**

**Via Docker Compose (Recommended):**
```bash
docker-compose up api -d --build
```

**Local Development:**
```bash
# Setup environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r services/api/requirements.txt

# Set environment variables
export MYSQL_HOST=localhost  # PowerShell: $env:MYSQL_HOST="localhost"

# Run with reload
uvicorn services.api.server:app --reload --port 8136
```

**Testing the Service:**
```bash
# Health check
curl http://localhost:8136/healthz

# API documentation  
open http://localhost:8136/docs

# Sample API call
curl http://localhost:8136/products?name=vở&limit=3
```

### **Error Handling & Logging**
- HTTP exception handlers cho clean error responses
- Console logging cho development (có thể extend cho production)
- Pydantic validation errors  422 responses
- Database errors  500 responses với generic message

### **Security Considerations**
- **Development**: CORS enabled, no authentication
- **Production**: Recommend JWT/API keys, HTTPS reverse proxy
- **Input Validation**: Pydantic schemas prevent injection
- **Database**: Parameterized queries via repository layer

##  API DOCUMENTATION

Để xem chi tiết API endpoints với examples:
 **Xem file: `api_endpoint.txt`** - Complete API reference với JSON examples

Để test API interactively:  
 **Visit: `http://localhost:8136/docs`** - Swagger UI

---

**services/api - REST API Service for IoT Cart Management System**  
*Part of Advanced Support Squad v2.1*
