-- Thêm dữ liệu mẫu cho cart_config - CHỈ KHI BẢNG TRỐNG
USE iotc25_advanced_support_squad;

-- Chỉ insert nếu bảng cart_config trống
INSERT INTO cart_config 
(cart_id, cart_position, cart_state, cart_voice_cmd, cart_ota, cam_stream_url)
SELECT 142, 
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 
 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 
 'c3d4e5f6-g7h8-9012-cdef-345678901234', 
 'd4e5f6g7-h8i9-0123-def0-456789012345',
 'rtsp://192.168.1.100:8554/cart142'
WHERE NOT EXISTS (SELECT 1 FROM cart_config LIMIT 1);
