from decimal import Decimal
from typing import Annotated, Union, Literal
from pydantic import BaseModel, Field, ConfigDict

# ---------- Request (upsert) ----------

class AbsoluteItem(BaseModel):
    """Dòng item với số lượng tuyệt đối (>=0)."""
    product_id: int = Field(ge=1, description="ID sản phẩm")
    quantity: Decimal = Field(ge=0, description="Số lượng tuyệt đối (decimal hỗ trợ cả đơn vị và khối lượng)")

class DeltaChange(BaseModel):
    """Dòng thay đổi số lượng cộng/trừ (có thể âm)."""
    product_id: int = Field(ge=1, description="ID sản phẩm")
    delta: Decimal = Field(description="Cộng/trừ số lượng (âm/dương, decimal hỗ trợ cả đơn vị và khối lượng)")

class ReplaceUpsert(BaseModel):
    """
    TRẠNG THÁI MỚI NHẤT THAY THẾ TOÀN BỘ TRẠNG THÁI CŨ.
    Server sẽ xóa toàn bộ cart_items của cart_id, rồi insert đúng danh sách 'items'.
    'items' rỗng => giỏ rỗng.
    """
    mode: Literal["replace"]
    items: list[AbsoluteItem]

class MergeUpsert(BaseModel):
    """
    GHI THEO SỐ LƯỢNG TUYỆT ĐỐI cho các item có mặt; phần khác giữ nguyên.
    (Dùng khi muốn cập nhật một phần.)
    """
    mode: Literal["merge"]
    items: list[AbsoluteItem]

class DeltaUpsert(BaseModel):
    """
    CỘNG/TRỪ theo delta (âm/dương).
    (Dùng cho kịch bản thêm/bớt.)
    """
    mode: Literal["delta"]
    changes: list[DeltaChange]

# Union phân biệt theo field 'mode'
CartUpsert = Annotated[
    Union[ReplaceUpsert, MergeUpsert, DeltaUpsert],
    Field(discriminator="mode")
]

# ---------- Response (GET /cart/{cart_id}) ----------

class CartItem(BaseModel):
    """Một mục trong giỏ khi trả về cho client (đã JOIN tên & giá)."""
    product_id: int = Field(ge=1)
    name: str
    quantity: Decimal = Field(ge=0, description="Số lượng trong giỏ (decimal hỗ trợ cả đơn vị và khối lượng)")
    price: Decimal = Field(ge=0)
    weight_kg: Decimal | None = Field(default=None, description="Trọng lượng (kg)")
    subtotal: Decimal = Field(ge=0)
    model_config = ConfigDict(from_attributes=True)

class CartResponse(BaseModel):
    """Tổng quan giỏ hàng."""
    cart_id: int = Field(ge=1)
    items: list[CartItem]
    total: Decimal = Field(ge=0)
