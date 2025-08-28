# services/api/schemas/product.py
from datetime import date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class Product(BaseModel):
    """
    Dùng cho các list đơn giản: id, name, price, weight.
    """
    product_id: int = Field(ge=1, description="ID sản phẩm")
    name: str = Field(min_length=1, description="Tên sản phẩm")
    price: Decimal = Field(ge=0, description="Giá một đơn vị")
    quantity: Decimal = Field(ge=0, description="Số lượng còn trong kho (decimal hỗ trợ cả đơn vị và khối lượng)")
    weight_kg: Optional[Decimal] = Field(default=None, ge=0, description="Khối lượng (kg) - 0 = bán theo số lượng, >0 = bán theo cân")

    model_config = ConfigDict(from_attributes=True)


class ProductListItem(BaseModel):
    """
    Kiểu rút gọn cho danh sách theo KHU VỰC / theo LOẠI.
    Trả: id, name, price, type, area, weight_kg.
    """
    product_id: int = Field(ge=1)
    name: str
    price: Decimal = Field(ge=0)
    quantity: Decimal = Field(ge=0, description="Số lượng còn trong kho (decimal hỗ trợ cả đơn vị và khối lượng)")
    type: Optional[str] = Field(default=None, description="Loại sản phẩm")
    area: Optional[str] = Field(default=None, description="Khu vực bày sản phẩm")
    weight_kg: Optional[Decimal] = Field(default=None, ge=0, description="Khối lượng (kg) - 0 = bán theo số lượng, >0 = bán theo cân")

    model_config = ConfigDict(from_attributes=True)


class ProductDetail(Product):
    """
    Kiểu CHI TIẾT (map đầy đủ cột trong MySQL).
    Dùng cho:
    - GET /products/{id}
    - GET /products?name=...  (search theo tên, trả FULL)
    """
    type: str = Field(description="Loại sản phẩm")
    area: str | None = Field(default=None, description="Khu vực bày sản phẩm")
    manufacturer: str | None = Field(default=None, description="Hãng sản xuất")
    expiry_or_mfg_date: date | None = Field(default=None, description="Hạn sử dụng hoặc ngày sản xuất")
    origin: str | None = Field(default=None, description="Xuất xứ")
    info1: str | None = Field(default=None, description="Thông tin 1")
    info2: str | None = Field(default=None, description="Thông tin 2")
    detail1: str | None = Field(default=None, description="Chi tiết 1")
    detail2: str | None = Field(default=None, description="Chi tiết 2")


class ProductSimple(BaseModel):
    """
    Schema đơn giản cho list-all-product: chỉ ID và name.
    """
    product_id: int = Field(ge=1, description="ID sản phẩm")
    name: str = Field(min_length=1, description="Tên sản phẩm")

    model_config = ConfigDict(from_attributes=True)


class ProductUpdate(BaseModel):
    """
    Schema cho update/create product - tất cả trường optional trừ required fields.
    """
    product_name: str = Field(min_length=1, max_length=255, description="Tên sản phẩm (bắt buộc)")
    product_type: str = Field(min_length=1, max_length=64, description="Loại sản phẩm (bắt buộc)")
    area: Optional[str] = Field(default=None, max_length=64, description="Khu vực bày sản phẩm")
    price: Decimal = Field(ge=0, description="Giá một đơn vị (bắt buộc, >= 0)")
    quantity: Decimal = Field(ge=0, description="Số lượng trong kho (bắt buộc, >= 0, decimal hỗ trợ cả đơn vị và khối lượng)")
    weight_kg: Optional[Decimal] = Field(default=None, ge=0, description="Khối lượng (kg) - 0 = bán theo số lượng, >0 = bán theo cân")
    manufacturer: Optional[str] = Field(default=None, max_length=128, description="Hãng sản xuất")
    expiry_or_mfg_date: Optional[date] = Field(default=None, description="Hạn sử dụng hoặc ngày sản xuất")
    origin: Optional[str] = Field(default=None, max_length=128, description="Xuất xứ")
    info1: Optional[str] = Field(default=None, max_length=255, description="Thông tin 1")
    info2: Optional[str] = Field(default=None, max_length=255, description="Thông tin 2")
    detail1: Optional[str] = Field(default=None, max_length=255, description="Chi tiết 1")
    detail2: Optional[str] = Field(default=None, max_length=255, description="Chi tiết 2")

    model_config = ConfigDict(from_attributes=True)
