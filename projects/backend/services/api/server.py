# services/api/server.py
"""
Simple FastAPI application for IoTC25 Advanced Support Squad.
"""
from decimal import Decimal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services.api.schemas.cart_inventory import CartUpsert, CartResponse, CartItem
from services.api.schemas.product import Product, ProductDetail, ProductListItem, ProductSimple, ProductUpdate
from services.api.schemas.cart_config import CartConfigRequest, CartConfigResponse
from services.api.schemas.map_beacon import MapBeaconRequest, MapBeaconResponse, MapBeaconListResponse
from services.shared.services import ProductService, CartService, CartConfigService, MapBeaconService
from services.shared.settings import get_settings

# Get settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="IoTC25 Advanced Support Squad API",
    version="2.0.0",
    description="API for product and cart management"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create services
product_service = ProductService()
cart_service = CartService()

# Health check endpoint
@app.get("/healthz", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

# Cart inventory endpoints
@app.post("/cart_inventory/{cart_id}/items", tags=["Carts Inventory"])
async def update_cart_items(cart_id: int, cart_data: CartUpsert):
    """Create or update cart items"""
    try:
        result = cart_service.upsert_cart_items(cart_id, cart_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/cart_inventory/{cart_id}", response_model=CartResponse, tags=["Carts Inventory"])
async def get_cart_detail(cart_id: int):
    """Get cart detail by ID"""
    try:
        cart = cart_service.get_cart_with_totals(cart_id)
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")
        return cart
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Product endpoints  
@app.get("/products/list-all-product", response_model=list[ProductSimple], tags=["Products"])
async def list_all_products():
    """Trả lại toàn bộ danh sách sản phẩm (chỉ ID và name)"""
    try:
        products = product_service.list_all_products_simple()
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products", response_model=list[ProductListItem], tags=["Products"])
async def search_products(name: str = None, limit: int = 50):
    """Search products by name"""
    try:
        products = product_service.search_products(name=name, limit=limit)
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products/{product_id}", response_model=ProductDetail, tags=["Products"])
async def get_product_detail(product_id: int):
    """Get product detail by ID"""
    try:
        product = product_service.get_product_detail(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products/by-area/{area}", response_model=list[ProductListItem], tags=["Products"])
async def get_products_by_area(area: str, limit: int = 50):
    """Get products by area"""
    try:
        products = product_service.list_products_by_area(area=area, limit=limit)
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products/by-type/{product_type}", response_model=list[ProductListItem], tags=["Products"])
async def get_products_by_type(product_type: str, limit: int = 50):
    """Get products by type - accepts any string, not limited to enum"""
    try:
        products = product_service.list_products_by_type(product_type=product_type, limit=limit)
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/products/update-product/{product_id}", response_model=ProductDetail, tags=["Products"])
async def update_product(product_id: int, product_data: ProductUpdate):
    """
    Cập nhật hoặc tạo mới sản phẩm:
    - Nếu product_id chưa tồn tại: Tạo mới với đầy đủ thông tin
    - Nếu product_id đã tồn tại: Cập nhật thông tin, trường NULL có thể thiếu
    """
    try:
        # Validate product_id
        if product_id <= 0:
            raise HTTPException(
                status_code=400,
                detail="Product ID must be a positive integer"
            )
        
        # Convert pydantic model to dict, handling None values properly
        product_dict = product_data.model_dump()
        
        # Validate required fields for business logic
        required_fields = ['product_name', 'product_type', 'price', 'quantity']
        for field in required_fields:
            if product_dict.get(field) is None:
                raise HTTPException(
                    status_code=400,
                    detail=f"Required field '{field}' cannot be null or empty"
                )
        
        # Handle empty strings as NULL for optional fields
        optional_fields = ['area', 'manufacturer', 'origin', 'info1', 'info2', 'detail1', 'detail2']
        for field in optional_fields:
            if field in product_dict and product_dict[field] == "":
                product_dict[field] = None
        
        result = product_service.update_or_create_product(product_id, product_dict)
        return result
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/products/delete-product/{product_id}", tags=["Products"])
async def delete_product(product_id: int):
    """
    Xóa sản phẩm theo ID
    """
    try:
        result = product_service.delete_product(product_id)
        return result
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Cart Config Endpoints
cart_config_service = CartConfigService()

# Map Beacon Endpoints
map_beacon_service = MapBeaconService()

@app.get("/cart_infor/{cart_id}", response_model=CartConfigResponse, tags=["Carts Config"])
async def get_cart_config(cart_id: int):
    """Lấy thông tin cấu hình của cart"""
    try:
        config = cart_config_service.get_cart_config(cart_id)
        return config
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/cart_infor/{cart_id}", response_model=CartConfigResponse, tags=["Carts Config"])
async def update_cart_config(cart_id: int, config: CartConfigRequest):
    """Cập nhật hoặc tạo mới cấu hình cart"""
    try:
        updated_config = cart_config_service.update_cart_config(cart_id, config.model_dump())
        return updated_config
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/map_beacon/{map_id}", response_model=MapBeaconListResponse, tags=["Map Beacon"])
async def get_map_beacons(map_id: int):
    """Lấy tất cả beacon của map_id"""
    try:
        beacons_data = map_beacon_service.get_map_beacons(map_id)
        return beacons_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/map_beacon/{map_id}/{beacon_id}", response_model=MapBeaconResponse, tags=["Map Beacon"])
async def get_beacon_config(map_id: int, beacon_id: str):
    """Lấy thông tin cấu hình của 1 beacon cụ thể"""
    try:
        beacon = map_beacon_service.get_beacon_config(map_id, beacon_id)
        return beacon
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/map_beacon/{map_id}/{beacon_id}", response_model=MapBeaconResponse, tags=["Map Beacon"])
async def update_beacon_config(map_id: int, beacon_id: str, beacon: MapBeaconRequest):
    """Cập nhật hoặc tạo mới cấu hình beacon"""
    try:
        updated_beacon = map_beacon_service.update_beacon_config(map_id, beacon_id, beacon.model_dump())
        return updated_beacon
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Run the application
if __name__ == "__main__":
    import uvicorn
    
    port = int(settings.api_port)
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )

