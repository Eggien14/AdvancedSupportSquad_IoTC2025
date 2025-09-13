-- Thêm dữ liệu mẫu cho map_beacon - CHỈ KHI BẢNG TRỐNG
USE iotc25_advanced_support_squad;

-- Chỉ insert nếu bảng map_beacon trống
INSERT INTO map_beacon (
  map_id, 
  beacon_id, 
  beacon_mac_address, 
  beacon_x_coordinate, 
  beacon_y_coordinate, 
  beacon_D0, 
  beacon_n
)
SELECT * FROM (
SELECT 510 AS map_id, '01' AS beacon_id, 'AA:BB:CC:01:01:01' AS beacon_mac_address, 
       0.0 AS beacon_x_coordinate, 0.0 AS beacon_y_coordinate, -60.0 AS beacon_D0, 1.8 AS beacon_n
UNION ALL
SELECT 510, '02', 'AA:BB:CC:01:01:02', 0.0, 10.0, -60.0, 1.8
UNION ALL
SELECT 510, '03', 'AA:BB:CC:01:01:03', 10.0, 10.0, -60.0, 1.8
UNION ALL
SELECT 510, '04', 'AA:BB:CC:01:01:04', 10.0, 0.0, -60.0, 1.8
) AS temp_map_beacons
WHERE NOT EXISTS (SELECT 1 FROM map_beacon LIMIT 1);