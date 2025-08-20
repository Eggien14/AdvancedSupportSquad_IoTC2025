# services/api/schemas/product.py
from datetime import date
from decimal import Decimal
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict


class ProductType(str, Enum):
    """Loại sản phẩm (mapping 1–1 với DB)."""
    food = "food"                # Đồ ăn
    drink = "drink"              # Nước uống
    household = "household"      # Đồ gia dụng
    stationery = "stationery"    # Văn phòng phẩm


class Product(BaseModel):
    """
    Kiểu rút gọn cũ (giữ lại nếu cần).
    Dùng cho các list đơn giản: id, name, price.
    """
    product_id: int = Field(ge=1, description="ID sản phẩm")
    name: str = Field(min_length=1, description="Tên sản phẩm")
    price: Decimal = Field(ge=0, description="Giá một đơn vị")

    model_config = ConfigDict(from_attributes=True)


class ProductListItem(BaseModel):
    """
    Kiểu rút gọn cho danh sách theo KHU VỰC / theo LOẠI.
    Trả: id, name, price, type, area.
    """
    product_id: int = Field(ge=1)
    name: str
    price: Decimal = Field(ge=0)
    type: ProductType
    area: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ProductDetail(Product):
    """
    Kiểu CHI TIẾT (map đầy đủ cột trong MySQL).
    Dùng cho:
    - GET /products/{id}
    - GET /products?name=...  (search theo tên, trả FULL)
    """
    type: ProductType = Field(description="Loại sản phẩm")
    area: str | None = Field(default=None, description="Khu vực bày sản phẩm")
    manufacturer: str | None = Field(default=None, description="Hãng sản xuất")
    expiry_or_mfg_date: date | None = Field(default=None, description="Hạn sử dụng hoặc ngày sản xuất")
    origin: str | None = Field(default=None, description="Xuất xứ")
    info1: str | None = Field(default=None, description="Thông tin 1")
    info2: str | None = Field(default=None, description="Thông tin 2")
    detail1: str | None = Field(default=None, description="Chi tiết 1")
    detail2: str | None = Field(default=None, description="Chi tiết 2")
