-- Thêm dữ liệu mẫu cho cart_config - CHỈ KHI BẢNG TRỐNG
USE iotc25_advanced_support_squad;

-- Chỉ insert nếu bảng cart_config trống
INSERT INTO cart_config 
(cart_id, cart_mac_address, cart_position, cart_state, cart_voice_cmd, cart_firmware_update, cam_stream_url)
SELECT 142, 
 'C0:2C:ED:90:AD:C3',
 '11111111-1111-1111-1111-111111111111', 
 '22222222-2222-2222-2222-222222222222', 
 '33333333-3333-3333-3333-333333333333', 
 '44444444-4444-4444-4444-444444444444',
 'http://192.168.95.242:81/stream'
WHERE NOT EXISTS (SELECT 1 FROM cart_config LIMIT 1);

-- Thêm cart 105
INSERT INTO cart_config 
(cart_id, cart_mac_address, cart_position, cart_state, cart_voice_cmd, cart_firmware_update, cam_stream_url)
SELECT 105,
 'AA:BB:CC:DD:EE:02',
 '55555555-5555-5555-5555-555555555555',
 '66666666-6666-6666-6666-666666666666',
 '77777777-7777-7777-7777-777777777777',
 '88888888-8888-8888-8888-888888888888',
 'rtsp://192.168.1.100:8554/cart105'
WHERE NOT EXISTS (SELECT 1 FROM cart_config WHERE cart_id = 105);
