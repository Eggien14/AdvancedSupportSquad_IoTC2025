# services/api/schemas/map_beacon.py
"""
Pydantic schemas cho map beacon API.
"""
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel


class MapBeaconResponse(BaseModel):
    """Response schema cho map beacon"""
    model_config = {"from_attributes": True}
    
    map_id: int
    beacon_id: str
    beacon_blea_uuid: Optional[str] = None
    beacon_x_coordinate: Optional[Decimal] = None
    beacon_y_coordinate: Optional[Decimal] = None
    beacon_D0: Optional[Decimal] = None
    beacon_n: Optional[Decimal] = None


class MapBeaconRequest(BaseModel):
    """Request schema cho cập nhật map beacon"""
    beacon_blea_uuid: Optional[str] = None
    beacon_x_coordinate: Optional[Decimal] = None
    beacon_y_coordinate: Optional[Decimal] = None
    beacon_D0: Optional[Decimal] = None
    beacon_n: Optional[Decimal] = None


class MapBeaconListResponse(BaseModel):
    """Response schema cho list tất cả beacon của map"""
    model_config = {"from_attributes": True}
    
    map_id: int
    beacons: List[MapBeaconResponse]
