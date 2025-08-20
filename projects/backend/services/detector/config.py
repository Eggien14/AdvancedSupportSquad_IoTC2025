from pathlib import Path
import os

PORT = 8100

# == MODEL PATH (cross-platform) ==
# Ưu tiên biến môi trường MODEL_PATH; nếu không có thì lấy file nằm cạnh config.py: ./models/my_model.pt
_BASE_DIR = Path(__file__).resolve().parent
_DEFAULT_MODEL = _BASE_DIR / "models" / "my_model.pt"
MODEL_PATH = os.getenv("MODEL_PATH", str(_DEFAULT_MODEL))

IMG_SIZE = (480, 480)                 # (W, H)
MIN_CONF_THRESHOLD = 0.6
DETECT_INTERVAL = 7                   # detect mỗi 7 khung

# Danh sách carts 
CARTS = [
    {"cart_id": 142, "source": "http://192.168.95.242:81/stream"},
]

# MÀU bbox 
BBOX_COLORS = [
    (167,121,78),(43,142,242),(89,87,225),(178,183,118),(79,161,89),
    (72,201,237),(161,122,176),(167,157,255),(95,117,156),(175,176,186)
]

# Mapping nhãn YOLO -> product_id 
LABEL_TO_ID = {
    'Calculator': 1,
    'Correction pen': 2,
    'Highlight pen': 3,
    'Note': 4,
    'Staple remover': 5,
    'Stapler': 6
}