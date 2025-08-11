import os
import sys
import glob
import time
import requests
import argparse
import cv2
import numpy as np
from collections import deque
from ultralytics import YOLO
import torch
from mqtt_handle import MqttHandler
from database_handle import DatabaseHandler
torch.cuda.is_available = lambda : False

IMAGE_OUTPUT = "latest.jpg"

class ObjectDetector:
    def __init__(self, cam_source, model_path, image_output = IMAGE_OUTPUT, 
                 detect_interval=7, img_size=(480, 480), min_conf_threshold=0.6):

        # Set path to cam and model
        self.cam_source = cam_source
        self.model_path = model_path

        # Set parameters for image output
        self.image_output = image_output
        self.detect_interval = detect_interval
        self.imgW, self.imgH = img_size

        # Variable for object counting 
        self.min_conf_threshold = min_conf_threshold
        self.frame_count = 0
        self.last_detections = None

        # Set up buffer for frame rate calculation
        self.frame_rate_calcs = deque([], maxlen=100)
        self.frame_rate_avg = 0

        self.bbox_colors = [(167,121,78),(43,142,242),(89,87,225),(178,183,118),(79,161,89),
                            (72,201,237),(161,122,176),(167,157,255),(95,117,156),(175,176,186)]
        
        self.model = YOLO(self.model_path, task='detect')
        self.labels = self.model.names

        #MQTT handle
        self.label_to_id = {
            'Calculator': 1,
            'Correction pen': 2,
            'Highlight pen': 3,
            'Note': 4,
            'Staple remover': 5,
            'Stapler': 6
        }
        self.mqtt_handler = MqttHandler()
        self.database_handler = DatabaseHandler()
    
    def start_detection(self):
        print("Start identifying object")
        cap = None
        
        while True:
            # Kiểm tra nếu chưa mở stream hoặc stream đã chết → mở lại
            if cap is None or not cap.isOpened():
                print("Stream not open or lost. Trying to reconnect...")
                cap = cv2.VideoCapture(self.cam_source)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                time.sleep(1)  
                continue

            # Start timer for calculating framerate
            t_start = time.perf_counter()

            # Capture frame-by-frame
            ret, frame = cap.read()
            if not ret:
                print("Can't receive frame. Closing and retrying...")
                cap.release()
                cap = None
                time.sleep(1)
                continue
            
            # Resize frame, run inference, extract results
            frame = cv2.resize(frame, (self.imgW, self.imgH))
            self.frame_count += 1

            # Inference with yolo model
            if self.frame_count % self.detect_interval == 0:
                results = self.model(frame, verbose=False)
                # detections = results[0].boxes
                self.last_detections = results[0].boxes
                self.frame_count = 0
                
                # Count objects detected in the frame, key: classname, value: count
                object_counter = {}
                if self.last_detections is not None and self.last_detections.xyxy is not None:
                    for xyxy, cls, conf in zip(self.last_detections.xyxy, self.last_detections.cls, self.last_detections.conf):
                        classidx = int(cls.item())
                        classname = self.labels[classidx]
                        conf_val = conf.item()
                        if conf_val > self.min_conf_threshold:
                            object_counter[classname] = object_counter.get(classname, 0) + 1

                    #Tạo dictionary với key là id của sản phẩm, value là số lượng
                id_quantity = {}
                for label, qty in object_counter.items():
                    if label in self.label_to_id:
                        id_quantity[self.label_to_id[label]] = qty

                # Fetch product info from DB
                cart_list_message = self.database_handler.cart_list_response(id_quantity)

                # publish JSON via MQTT
                self.mqtt_handler.publish_message("product_detected", cart_list_message)

            # Draw detections
            frame = self.draw_detections(frame)

            # Save snapshot every detection cycle
            # if self.frame_count == 0:
            cv2.imwrite(self.image_output, frame)

            # Display trên server
            cv2.putText(frame, f'FPS: {self.frame_rate_avg:0.2f}', (10,20), cv2.FONT_HERSHEY_SIMPLEX, .7, (0,255,255), 2)
            cv2.imshow("Camera detections", frame)
            if cv2.waitKey(1) == ord('q'):
                break

            # Calculate frame rate
            t_stop = time.perf_counter()
            t_total = t_stop - t_start
            self.frame_rate_calcs.appendleft(1 / t_total)
            self.frame_rate_avg = np.mean(self.frame_rate_calcs)
        
        cap.release()
        cv2.destroyAllWindows()

    # Draw bounding boxes and labels on the frame
    def draw_detections(self, frame):
        # Reset variable for object counting 
        object_count = 0
        detections = self.last_detections
     
        # Draw bounding boxes and labels on the frame
        if detections is not None and detections.xyxy is not None:
            for xyxy, cls, conf in zip(detections.xyxy, detections.cls, detections.conf):
                xmin, ymin, xmax, ymax = map(int, xyxy.tolist())
                classidx = int(cls.item())
                classname = self.labels[classidx]
                conf_val = conf.item()

                if conf_val > self.min_conf_threshold:
                    color = self.bbox_colors[classidx % len(self.bbox_colors)]
                    cv2.rectangle(frame, (xmin, ymin), (xmax, ymax), color, 2)

                    label = f'{classname}: {int(conf_val * 100)}%'
                    label_size, base_line = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                    label_ymin = max(ymin, label_size[1] + 10)
                    cv2.rectangle(frame, (xmin, label_ymin - label_size[1] - 10),
                                (xmin + label_size[0], label_ymin + base_line - 10), color, cv2.FILLED)
                    cv2.putText(frame, label, (xmin, label_ymin - 7),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
                    object_count += 1 

        cv2.putText(frame, f'Number of objects: {object_count}', (10,40), cv2.FONT_HERSHEY_SIMPLEX, .7, (0,255,255), 2)
        return frame