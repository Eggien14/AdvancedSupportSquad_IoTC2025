import threading
import uvicorn
from object_detect import ObjectDetector
from server_app import ShoppingServer

#Server configuration
SEVER_PORT = 8000
SERVER_HOST = "0.0.0.0"
CAM_SOURCE = "http://192.168.0.103:81/stream"
MODEL_PATH = "my_model.pt"

def run_server():
    server = ShoppingServer()
    uvicorn.run(server.get_app(), host="0.0.0.0", port=SEVER_PORT)

if __name__ == '__main__':
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()

    detector = ObjectDetector(
        cam_source = CAM_SOURCE,
        model_path = MODEL_PATH
    )
    detector.start_detection()
