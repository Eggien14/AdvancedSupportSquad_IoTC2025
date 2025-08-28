# services/api/schemas/cart_config.py
"""
Pydantic schemas cho cart configuration API.
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class CartConfigResponse(BaseModel):
    """Response schema cho cart configuration"""
    model_config = {"from_attributes": True}
    
    cart_id: int
    cart_position: Optional[str] = None
    cart_state: Optional[str] = None  
    cart_voice_cmd: Optional[str] = None
    cart_ota: Optional[str] = None
    cam_stream_url: Optional[str] = None


class CartConfigRequest(BaseModel):
    """Request schema cho cập nhật cart configuration"""
    cart_position: Optional[str] = None
    cart_state: Optional[str] = None
    cart_voice_cmd: Optional[str] = None 
    cart_ota: Optional[str] = None
    cam_stream_url: Optional[str] = None
