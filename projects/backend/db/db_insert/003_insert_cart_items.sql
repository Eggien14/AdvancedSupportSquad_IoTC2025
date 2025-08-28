-- Thêm dữ liệu mẫu cho cart_items - 2 xe đẩy với các sản phẩm ngẫu nhiên
-- Cart 142: 10 mặt hàng, Cart 105: 7 mặt hàng
USE iotc25_advanced_support_squad;

-- Chỉ insert nếu bảng cart_items trống
INSERT INTO cart_items (cart_id, product_id, quantity)
SELECT * FROM (
-- Cart 142: 10 mặt hàng (mix sản phẩm bán theo số lượng và theo cân)
SELECT 142 AS cart_id, 1 AS product_id, 2.000 AS quantity -- Mì Hảo Hảo: 2 gói
UNION ALL
SELECT 142, 2, 0.450 -- Táo Gala: 0.45kg (3 quả)
UNION ALL
SELECT 142, 3, 1.000 -- Bim bim POCA: 1 gói
UNION ALL
SELECT 142, 4, 0.300 -- Chuối sứ: 0.3kg (3 quả)
UNION ALL
SELECT 142, 5, 3.000 -- Bánh mỳ Kinh Đô: 3 ổ
UNION ALL
SELECT 142, 6, 0.060 -- Kẹo dẻo trái cây: 0.06kg (3 viên)
UNION ALL
SELECT 142, 7, 2.000 -- Bia Tiger: 2 lon
UNION ALL
SELECT 142, 8, 1.000 -- Cam Sanh: 1kg (5 quả)
UNION ALL
SELECT 142, 9, 1.000 -- Sữa Milo: 1 lốc
UNION ALL
SELECT 142, 10, 1.500 -- Nho xanh: 1.5kg (3 chùm)

-- Cart 105: 7 mặt hàng (mix sản phẩm bán theo số lượng và theo cân)
UNION ALL
SELECT 105, 11, 3.000 -- C2 vàng: 3 chai
UNION ALL
SELECT 105, 12, 1.000 -- Latte socola: 1 lon
UNION ALL
SELECT 105, 15, 2.000 -- Kem đánh răng: 2 tuýp
UNION ALL
SELECT 105, 17, 0.600 -- Xoài cát: 0.6kg (2 quả)
UNION ALL
SELECT 105, 19, 0.075 -- Kẹo dẻo hương cam: 0.075kg (3 viên)
UNION ALL
SELECT 105, 23, 2.000 -- Thịt heo xay: 2kg
UNION ALL
SELECT 105, 25, 4.000 -- Kẹo Chupa Chups: 4 cái
) AS temp_cart_items
WHERE NOT EXISTS (SELECT 1 FROM cart_items LIMIT 1);
