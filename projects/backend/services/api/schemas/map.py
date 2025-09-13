# services/api/schemas/map.py
"""
Pydantic schemas cho map API.
"""
from typing import Optional, List
from pydantic import BaseModel


class MapResponse(BaseModel):
    """Response schema cho map cell"""
    model_config = {"from_attributes": True}
    
    map_id: int
    x_coordinate: int
    y_coordinate: int
    area: Optional[str] = None


class MapRequest(BaseModel):
    """Request schema cho cập nhật map cell"""
    area: Optional[str] = None


class MapCellUpdate(BaseModel):
    """Schema cho cập nhật 1 cell trong bulk update"""
    x_coor: int
    y_coor: int
    area: Optional[str] = None


class MapBulkUpdateRequest(BaseModel):
    """Request schema cho bulk update nhiều cells"""
    cells: List[MapCellUpdate]


class MapListResponse(BaseModel):
    """Response schema cho list tất cả cells của map"""
    model_config = {"from_attributes": True}
    
    map_id: int
    cells: List[MapResponse]
