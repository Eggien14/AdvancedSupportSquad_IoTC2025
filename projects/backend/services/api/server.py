# services/api/server.py
from decimal import Decimal
from fastapi import FastAPI, HTTPException

from services.api.schemas.cart import CartUpsert, CartResponse, CartItem
from services.api.schemas.product import ProductType, Product, ProductDetail, ProductListItem
from services.shared.repos import ProductRepo, CartRepo

app = FastAPI(title="Cart API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # mở cho mọi origin để test
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)

# ALLOWED_ORIGINS = [
#     "http://homeassistant.local:8123",                          # HA bằng hostname (HTTP)
#     "http://192.168.102.10:8123",                               # HA bằng IP (HTTP)
#     "https://uxi7soczbvmgx2ceeypofsshklpfutyl.ui.nabu.casa",    # HA qua Nabu Casa (HTTPS)
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=ALLOWED_ORIGINS,
#     allow_methods=["GET", "OPTIONS"],
#     allow_headers=["*"],
#     allow_credentials=True,  # dùng True khi có cookie/withCredentials
# )

@app.get("/healthz")
def healthz():
    return {"status": "ok"}


# ---------- CART ----------

@app.post("/cart/{cart_id}/items")
def upsert_cart(cart_id: int, payload: CartUpsert):
    if cart_id <= 0:
        raise HTTPException(status_code=400, detail="cart_id must be >= 1")

    try:
        if payload.mode == "replace":
            CartRepo.replace(cart_id, ((it.product_id, it.quantity) for it in payload.items))
        elif payload.mode == "merge":
            CartRepo.merge(cart_id, ((it.product_id, it.quantity) for it in payload.items))
        elif payload.mode == "delta":
            CartRepo.apply_delta(cart_id, ((ch.product_id, ch.delta) for ch in payload.changes))
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported mode: {payload.mode}")
    except Exception as e:
        # ví dụ FK lỗi khi product_id không tồn tại
        raise HTTPException(status_code=400, detail=str(e))

    return {"ok": True, "mode": payload.mode, "items_count": CartRepo.count_items(cart_id)}


@app.get("/cart/{cart_id}", response_model=CartResponse)
def get_cart(cart_id: int):
    if cart_id <= 0:
        raise HTTPException(status_code=400, detail="cart_id must be >= 1")

    rows, total = CartRepo.fetch_joined(cart_id)
    items = [
        CartItem(
            product_id=row["product_id"],
            name=row["name"],
            quantity=row["quantity"],
            price=row["price"],
            subtotal=row["subtotal"],
        )
        for row in rows
    ]
    return CartResponse(cart_id=cart_id, items=items, total=total)


# ---------- PRODUCTS ----------

@app.get("/products/{product_id}", response_model=ProductDetail)
def get_product(product_id: int):
    row = ProductRepo.get_by_id(product_id)
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    return row

@app.get("/products", response_model=list[Product])
def search_products(name: str, limit: int = 20):
    return ProductRepo.search_by_name(name=name, limit=limit)

@app.get("/products/by-area", response_model=list[ProductListItem])
def list_products_by_area(area: str, limit: int = 50):
    """
    Liệt kê theo KHU VỰC: trả id, name, price, type, area.
    """
    return ProductRepo.list_by_area(area=area, limit=limit)

@app.get("/products/by-type/{p_type}", response_model=list[ProductListItem])
def list_products_by_type(p_type: ProductType, limit: int = 50):
    """
    Liệt kê theo LOẠI: trả id, name, price, type, area.
    """
    return ProductRepo.list_by_type(p_type=p_type.value, limit=limit)

