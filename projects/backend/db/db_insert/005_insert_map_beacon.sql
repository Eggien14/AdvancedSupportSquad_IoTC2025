-- Thêm dữ liệu mẫu cho map_beacon - CHỈ KHI BẢNG TRỐNG
USE iotc25_advanced_support_squad;

-- Chỉ insert nếu bảng map_beacon trống
INSERT INTO map_beacon (
  map_id, 
  beacon_id, 
  beacon_blea_uuid, 
  beacon_x_coordinate, 
  beacon_y_coordinate, 
  beacon_D0, 
  beacon_n
)
SELECT * FROM (
SELECT 510 AS map_id, '01' AS beacon_id, 'f7826da6-4fa2-4e98-8024-bc5b71e0893e' AS beacon_blea_uuid, 
       0.0 AS beacon_x_coordinate, 0.0 AS beacon_y_coordinate, -60.0 AS beacon_D0, 1.8 AS beacon_n
UNION ALL
SELECT 510, '02', 'f7826da6-4fa2-4e98-8024-bc5b71e0893f', 0.0, 10.0, -60.0, 1.8
UNION ALL
SELECT 510, '03', 'f7826da6-4fa2-4e98-8024-bc5b71e08940', 10.0, 10.0, -60.0, 1.8
UNION ALL
SELECT 510, '04', 'f7826da6-4fa2-4e98-8024-bc5b71e08941', 10.0, 0.0, -60.0, 1.8
) AS temp_map_beacons
WHERE NOT EXISTS (SELECT 1 FROM map_beacon LIMIT 1);