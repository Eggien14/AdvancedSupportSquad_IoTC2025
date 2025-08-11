import os
import time
import cv2
import time
import numpy as np
import json
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from database_handle import DatabaseHandler


IMAGE_OUTPUT = "latest.jpg"

class ShoppingServer:
    def __init__(self):
        self.app = FastAPI(title="Shopping Server")

        # Enable CORS
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        self.database_handler = DatabaseHandler()
        # Register routes
        self.register_routes()
        self.image_path = IMAGE_OUTPUT

    #Handle API
    def register_routes(self):

        @self.app.get("/image")
        def get_image():
            if os.path.exists(IMAGE_OUTPUT):
                return FileResponse(IMAGE_OUTPUT, media_type="image/jpeg")
            else:  
                raise HTTPException(status_code=404, detail="Image not found")
            
        @self.app.get("/stream")
        #http://<Server_IP>:8000/stream
        def video_stream():
            return StreamingResponse(self.mjpeg_generator(), 
                                     media_type='multipart/x-mixed-replace; boundary=frame',
                                     headers={
                                         "Cache-Control": "no-cache",
                                         "Connection": "keep-alive",
                                         "Pragma": "no-cache"
                                     })

        @self.app.post('/cart')
        async def handle_cart(request: Request):
            """
            Accepts:
              - JSON object {"1":2, "3":1}
            Returns product list 
            """
            data = await request.json()
            id_quantity = self.parse_cart_payload(data)     # {"1":2, "3":1} -> {1: 2, 3: 1}
            result = self.database_handler.cart_list_response(id_quantity)
            return JSONResponse(content=result)
    
    #Handler mjpeg streaming
    def mjpeg_generator(self):
        while True:
            try:
                if os.path.exists(self.image_path):
                    with open(self.image_path, 'rb') as f:
                        img_bytes = f.read()
                        if not img_bytes:
                            time.sleep(0.005)
                            continue
                        # Chuyển đổi bytes thành mảng numpy
                        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
                        frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
                    if frame is not None:
                        _, jpeg = cv2.imencode('.jpg', frame)
                        if jpeg is not None:
                            yield (b'--frame\r\n'
                                b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n')
            except Exception as e:
                print("MJPEG Streaming Error:", e)

            time.sleep(0.025) #40 FPS
    
    def parse_cart_payload(self, data):
        """
        Chuyển đổi payload JSON từ client thành dictionary với key là int, value là quantity
        Input: {"1":2, "3":1}
        Output: {1: 2, 3: 1}
        """
        if not isinstance(data, dict):
            raise HTTPException(status_code=400, detail="Invalid input format")
        id_quantity_map = {}
        for key, value in data.items():
            id_quantity_map[int(key)] = int(value)

        return id_quantity_map
    
    def get_app(self):
        return self.app