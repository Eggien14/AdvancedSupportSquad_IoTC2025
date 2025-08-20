from datetime import datetime, timezone
from typing import Dict, Optional, List
import threading

_latest_jpeg: Dict[int, bytes] = {}
_inventory: Dict[int, dict] = {}
_locks: Dict[int, threading.Lock] = {}
_global = threading.Lock()

def _lock_for(cid: int) -> threading.Lock:
    with _global:
        if cid not in _locks:
            _locks[cid] = threading.Lock()
        return _locks[cid]

def set_latest_jpeg(cart_id: int, jpg: bytes):
    with _lock_for(cart_id):
        _latest_jpeg[cart_id] = jpg

def get_latest_jpeg(cart_id: int) -> Optional[bytes]:
    with _lock_for(cart_id):
        return _latest_jpeg.get(cart_id)

def set_inventory(cart_id: int, items: List[dict]):
    _inventory[cart_id] = {
        "cart_id": cart_id,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "items": items,
    }

def get_inventory(cart_id: int) -> dict:
    return _inventory.get(cart_id, {"cart_id": cart_id, "updated_at": None, "items": []})