import json
from paho.mqtt import client as mqtt_client
import time

MQTT_BROKER = "localhost"     
MQTT_PORT = 1883


class MqttHandler:
    def __init__(self, broker=MQTT_BROKER, port=MQTT_PORT, client_id=None):
        self.broker = broker 
        self.port = port 
        # self.client = mqtt_client.Client(client_id or f"server-{int(time.time())}")
        self.client = mqtt_client.Client(
            mqtt_client.CallbackAPIVersion.VERSION1,
            client_id=client_id or f"server-{int(time.time())}"
            )

        self.client.connect(self.broker, self.port, keepalive=60)
        self.client.loop_start()

    def publish_message(self, topic, payload, qos=0, retain=False):
        """
        payload: any JSON-serializable
        """
        message = json.dumps(payload)
        self.client.publish(topic, message)
        print(f"[MQTT] published to {topic}: {message}")