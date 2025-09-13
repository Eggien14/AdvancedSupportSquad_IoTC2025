# services/api/server.py
"""
Simple FastAPI application for IoTC25 Advanced Support Squad.
"""
from decimal import Decimal
import decimal
import datetime
from typing import List
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
import time
import asyncio
from fastapi.responses import StreamingResponse, JSONResponse

from services.api.schemas.cart_inventory import CartUpsert, CartResponse, CartItem
from services.api.schemas.product import Product, ProductDetail, ProductListItem, ProductSimple, ProductUpdate
from services.api.schemas.cart_config import CartConfigRequest, CartConfigResponse
from services.api.schemas.map_beacon import MapBeaconRequest, MapBeaconResponse, MapBeaconListResponse
from services.api.schemas.map import MapRequest, MapResponse, MapListResponse, MapBulkUpdateRequest
from services.shared.services import ProductService, CartService, CartConfigService, MapBeaconService, MapService
from services.shared.settings import get_settings

# Get settings
settings = get_settings()

def _normalize(obj):
    """Normalize objects for JSON serialization"""
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {k: _normalize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_normalize(x) for x in obj]
    return obj

def _sig_from_inventory(inv: dict):
    """Tạo 'chữ ký' để phát hiện thay đổi nhanh gọn."""
    items = inv.get("items", [])
    pairs = tuple((it.get("product_id"), it.get("quantity", 0)) for it in items)
    return (inv.get("updated_at"), pairs)

# Create FastAPI app
app = FastAPI(
    title="IoTC25 Advanced Support Squad API",
    version="1.0.0",
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

# Map Endpoints
map_service = MapService()

@app.get("/cart_infor/list-all-cart", response_model=List[CartConfigResponse], tags=["Carts Config"])
async def list_all_carts():
    """List all carts in cart_config table"""
    try:
        carts = cart_config_service.get_all_carts()
        return carts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

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


@app.post("/cart_infor/delete-cart/{cart_id}", tags=["Carts Config"])
async def delete_cart(cart_id: int):
    """Xóa cart config theo cart_id"""
    try:
        success = cart_config_service.delete_cart(cart_id)
        if success:
            return {"ok": True, "message": f"Cart {cart_id} deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail=f"Cart {cart_id} not found")
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


@app.post("/map_beacon/delete-beacon/{map_id}/{beacon_id}", tags=["Map Beacon"])
async def delete_beacon(map_id: int, beacon_id: str):
    """Xóa beacon theo map_id và beacon_id"""
    try:
        success = map_beacon_service.delete_beacon(map_id, beacon_id)
        if success:
            return {"ok": True, "message": f"Beacon {beacon_id} in map {map_id} deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail=f"Beacon {beacon_id} in map {map_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/map_beacon/delete-map/{map_id}", tags=["Map Beacon"])
async def delete_map_beacons(map_id: int):
    """Xóa tất cả beacon theo map_id"""
    try:
        deleted_count = map_beacon_service.delete_map(map_id)
        return {"ok": True, "message": f"Deleted {deleted_count} beacons from map {map_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Map Endpoints
@app.get("/map/{map_id}", response_model=MapListResponse, tags=["Map"])
async def get_map_cells(map_id: int):
    """Lấy tất cả cells của map_id"""
    try:
        map_data = map_service.get_map_cells(map_id)
        return map_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/map/{map_id}/{x_coor}/{y_coor}", response_model=MapResponse, tags=["Map"])
async def get_map_cell(map_id: int, x_coor: int, y_coor: int):
    """Lấy thông tin của 1 cell cụ thể"""
    try:
        cell = map_service.get_cell_detail(map_id, x_coor, y_coor)
        return cell
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/map/{map_id}/{x_coor}/{y_coor}", response_model=MapResponse, tags=["Map"])
async def update_map_cell(map_id: int, x_coor: int, y_coor: int, cell_data: MapRequest):
    """Cập nhật hoặc tạo mới map cell"""
    try:
        updated_cell = map_service.update_cell(map_id, x_coor, y_coor, cell_data.model_dump())
        return updated_cell
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/map/delete-map/{map_id}", tags=["Map"])
async def delete_map(map_id: int):
    """Xóa tất cả cells theo map_id"""
    try:
        result = map_service.delete_map(map_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/map/map-upload/{map_id}", tags=["Map"])
async def bulk_update_map_cells(map_id: int, bulk_data: MapBulkUpdateRequest):
    """Bulk update nhiều cells cùng lúc"""
    try:
        # Convert pydantic model to list of dicts
        cells_data = [cell.model_dump() for cell in bulk_data.cells]
        result = map_service.bulk_update_cells(map_id, cells_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# ---------- WebSocket streams ----------

# ws://<IP>:8136/ws/cart_inventory/142
@app.websocket("/ws/cart_inventory/{cart_id}")
async def ws_cart_inventory(websocket: WebSocket, cart_id: int):
    await websocket.accept()
    last_payload = None
    try:
        while True:
            try:
                # Lấy dữ liệu như /cart_inventory + weights
                cart = cart_service.get_cart_with_totals(cart_id)
                if not cart:
                    await asyncio.sleep(1)
                    continue

                # Nếu khác lần trước thì gửi
                if cart != last_payload:
                    await websocket.send_json(cart)
                    last_payload = cart

                # Nhịp kiểm tra mỗi 0.5s (tùy chỉnh)
                await asyncio.sleep(0.7)

            except Exception as e:
                print(f"ws_cart_inventory error: {e}")
                await asyncio.sleep(1)
    except WebSocketDisconnect:
        print(f"Client disconnected from ws/cart_inventory/{cart_id}")

# ws://<IP>:8136/ws/product-detect/142
@app.websocket("/ws/product-detect/{cart_id}")
async def ws_product_detect(websocket: WebSocket, cart_id: int):
    await websocket.accept()
    session = requests.Session()
    last_signature = None  # Track changes for both empty and non-empty
    try:
        while True:
            try:
                r = session.get(f"http://detector:8100/inventory", params={"cart_id": cart_id}, timeout=2)
                if r.ok:
                    inv = r.json()
                    items_out = []
                    for it in inv.get("items", []):
                        pid = it.get("product_id")
                        if pid is None:
                            continue
                        try:
                            prod = product_service.get_product_detail(pid)
                        except Exception:
                            continue
                        if hasattr(prod, "model_dump"):
                            pdict = prod.model_dump()
                        elif hasattr(prod, "dict"):
                            pdict = prod.dict()
                        else:
                            pdict = dict(prod)
                        pdict["quantity"] = it.get("quantity", 0)
                        items_out.append(pdict)

                    payload = {
                        "cart_id": cart_id,
                        "updated_at": inv.get("updated_at"),
                        "items": items_out
                    }
                    payload = _normalize(payload)

                    # Create signature for change detection
                    current_signature = _sig_from_inventory(payload)
                    
                    # Only send if signature changed
                    if current_signature != last_signature:
                        await websocket.send_json(payload)
                        last_signature = current_signature

                await asyncio.sleep(0.7)
            except Exception as e:
                print("ws product_detect error:", e)
                await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        pass
    finally:
        try:
            await websocket.close()
        except:
            pass


# ---------- Cart stream ----------
@app.get("/stream")
def stream(cart_id: int = Query(...)):

    session = requests.Session()

    def mjpeg_generator():
        while True:
            try:
                resp = session.get(
                    f"http://detector:8100/image?cart_id={cart_id}",
                    timeout=2
                )
                if resp.status_code == 200:
                    frame = resp.content
                    yield (b"--frame\r\n"
                           b"Content-Type: image/jpeg\r\n\r\n" +
                           frame + b"\r\n")
                else:
                    time.sleep(0.2)
                    continue
            except Exception as e:
                print("stream error:", e)
                time.sleep(0.5)
                continue

            time.sleep(0.025)  # ~40 FPS

    return StreamingResponse(
        mjpeg_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Pragma": "no-cache"
        }
    )


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