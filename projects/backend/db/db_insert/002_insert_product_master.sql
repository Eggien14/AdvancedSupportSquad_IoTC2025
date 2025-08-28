-- Thêm dữ liệu mẫu cho product_master (UTF8MB4) - CHỈ KHI BẢNG TRỐNG
-- Cột: product_name, product_type, area, price, quantity, weight_kg, manufacturer, expiry_or_mfg_date, origin, info1, info2, detail1, detail2
USE iotc25_advanced_support_squad;

-- Set charset đúng cho session
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Chỉ insert nếu bảng product_master trống
-- Chèn dữ liệu mẫu cho bảng product_master
-- 40 sản phẩm: 30 bán theo số lượng (weight_kg=0), 10 bán theo cân (weight_kg>0)
-- Sắp xếp ngẫu nhiên

INSERT INTO product_master
(product_name, product_type, area, price, quantity, weight_kg, manufacturer, expiry_or_mfg_date, origin, info1, info2, detail1, detail2)
SELECT * FROM (
-- Sản phẩm 1-10 (mix số lượng và cân)
SELECT 'Mì Hảo Hảo mì xào tôm chua' AS product_name, 'food' AS product_type, 'TK14' AS area, 3500.00 AS price, 999.000 AS quantity, 0.000 AS weight_kg,
 'Acecook Việt Nam' AS manufacturer, NULL AS expiry_or_mfg_date, 'Việt Nam' AS origin,
 'Khối lượng-75g' AS info1, 'Phong cách-Mì xào khô' AS info2,
 'Vị-Tôm chua ngọt với sợi mì dai' AS detail1, 'Cách dùng-Chắt nước rồi trộn sốt' AS detail2
UNION ALL
SELECT 'Táo Gala Việt Nam', 'food', 'TK14', 1500.00, 100.000, 0.150,
 'Nông trại Đà Lạt', NULL, 'Việt Nam',
 'Trọng lượng-150g/quả' AS info1, 'Loại-Táo bán theo cân' AS info2,
 'Chất lượng-Táo Gala tươi ngon tự nhiên' AS detail1, 'Tính tiền-(khối lượng cart ÷ 0.150) × 1500đ' AS detail2
UNION ALL
SELECT 'Bim bim POCA gà quay da giòn', 'food', 'TK14', 4500.00, 999.000, 0.000,
 'PepsiCo Vietnam', NULL, 'Việt Nam',
 'Khối lượng-65g' AS info1, 'Loại-Snack khoai tây' AS info2,
 'Vị-Gà quay da giòn đậm đà' AS detail1, 'Đóng gói-Gói lẻ tiện dụng' AS detail2
UNION ALL
SELECT 'Chuối sứ Lào Cai', 'food', 'TK14', 800.00, 50.000, 0.100,
 'Hợp tác xã Lào Cai', NULL, 'Việt Nam',
 'Trọng lượng-100g/quả' AS info1, 'Loại-Chuối bán theo cân' AS info2,
 'Chất lượng-Chuối sứ ngọt tự nhiên' AS detail1, 'Tính tiền-(khối lượng cart ÷ 0.100) × 800đ' AS detail2
UNION ALL
SELECT 'Bánh mỳ Kinh Đô vị lá dứa', 'food', 'TK14', 8000.00, 999.000, 0.000,
 'Mondelez Kinh Đô Việt Nam', NULL, 'Việt Nam',
 'Khối lượng-40g' AS info1, 'Dòng-Bánh mì tươi ổ ngắn' AS info2,
 'Vị-Lá dứa với vỏ mềm nhân kem' AS detail1, 'Công dụng-Bữa sáng tiện lợi' AS detail2
UNION ALL
SELECT 'Kẹo dẻo trái cây', 'food', 'TK14', 500.00, 5.000, 0.020,
 'Mondelez International', NULL, 'Việt Nam',
 'Trọng lượng-20g/viên' AS info1, 'Loại-Kẹo dẻo bán theo cân' AS info2,
 'Vị-Nhiều vị trái cây tự nhiên' AS detail1, 'Tính tiền-(khối lượng cart ÷ 0.020) × 500đ' AS detail2
UNION ALL
SELECT 'Bia Tiger xanh', 'drink', 'QL10', 12000.00, 999.000, 0.000,
 'Heineken Vietnam', NULL, 'Việt Nam',
 'Dung tích-330ml' AS info1, 'Quy cách-Lon/chai 330ml' AS info2,
 'Loại-Bia lager Tiger truyền thống' AS detail1, 'Đóng gói-Thùng 24 lon/chai' AS detail2
UNION ALL
SELECT 'Cam Sanh Hòa Bình', 'food', 'TK14', 2500.00, 30.000, 0.200,
 'Nông trại Hòa Bình', NULL, 'Việt Nam',
 'Trọng lượng-200g/quả' AS info1, 'Loại-Cam bán theo cân' AS info2,
 'Chất lượng-Cam Sanh ngọt tự nhiên' AS detail1, 'Tính tiền-(khối lượng cart ÷ 0.200) × 2500đ' AS detail2
UNION ALL
SELECT 'Sữa Milo lốc 4 hộp', 'drink', 'QL10', 25000.00, 999.000, 0.000,
 'Nestlé Việt Nam', NULL, 'Việt Nam',
 'Thể tích-180ml x4' AS info1, 'Dòng-UHT lúa mạch' AS info2,
 'Thành phần-Bổ sung Protomalt canxi vitamin' AS detail1, 'Cách dùng-Ngon hơn khi uống lạnh' AS detail2
UNION ALL
SELECT 'Nho xanh Ninh Thuận', 'food', 'TK14', 3000.00, 20.000, 0.500,
 'Vựa trái cây Ninh Thuận', NULL, 'Việt Nam',
 'Trọng lượng-500g/chùm' AS info1, 'Loại-Nho bán theo cân' AS info2,
 'Chất lượng-Nho xanh ngọt mát tự nhiên' AS detail1, 'Tính tiền-(khối lượng cart ÷ 0.500) × 3000đ' AS detail2

-- Sản phẩm 11-20
UNION ALL
SELECT 'C2 vàng', 'drink', 'QL10', 8000.00, 999.000, 0.000,
 'URC Việt Nam', NULL, 'Việt Nam',
 'Dung tích-455ml' AS info1, 'Hương-Chanh nhãn vàng' AS info2,
 'Loại-Trà xanh đóng chai vị chanh' AS detail1, 'Đóng gói-Thùng 24 chai' AS detail2
UNION ALL
SELECT 'Latte socola', 'drink', 'QL10', 15000.00, 999.000, 0.000,
 'Nestlé NESCAFÉ', NULL, 'Thái Lan',
 'Dung tích-180ml' AS info1, 'Dòng-Cà phê sữa lon' AS info2,
 'Vị-NESCAFÉ Latte socola/mocha uống liền' AS detail1, 'Cách dùng-Ngon hơn khi dùng lạnh' AS detail2
UNION ALL
SELECT 'Bánh xà phòng Lifebuoy xanh', 'household', 'TH36', 12000.00, 999.000, 0.000,
 'Unilever Việt Nam', NULL, 'Việt Nam',
 'Khối lượng-90g' AS info1, 'Dòng-Cool Fresh Protection 10' AS info2,
 'Tác dụng-Xà phòng thỏi mát sạch loại bỏ 99.9% vi khuẩn' AS detail1, 'Công dụng-Phù hợp nhiều loại da' AS detail2
UNION ALL
SELECT 'Bàn chải Suwadee', 'household', 'TH36', 45000.00, 999.000, 0.000,
 'Hoa Thái Toothbrush', NULL, 'Việt Nam',
 'Quy cách-Hộp 18 cây' AS info1, 'Lông-Siêu mịn' AS info2,
 'Loại-Bàn chải đánh răng thương hiệu Suwadee' AS detail1, 'Đối tượng-Dòng cho người lớn' AS detail2
UNION ALL
SELECT 'Kem đánh răng Colgate', 'household', 'TH36', 25000.00, 999.000, 0.000,
 'Colgate-Palmolive', NULL, 'Việt Nam',
 'Khối lượng-180g' AS info1, 'Loại-Chăm sóc răng miệng' AS info2,
 'Tác dụng-Bảo vệ răng chống sâu răng' AS detail1, 'Hương vị-Bạc hà mát lạnh' AS detail2
UNION ALL
SELECT 'Vở Hồng Hà', 'stationery', 'ND18', 8000.00, 999.000, 0.000,
 'Công ty CP Văn phòng phẩm Hồng Hà', NULL, 'Việt Nam',
 'Số trang-80' AS info1, 'Kích thước-170x240mm' AS info2,
 'Loại-Vở 4 ô ly/ghi chép giấy 100 g/m² viết êm' AS detail1, 'Đối tượng-Phù hợp học sinh in thương hiệu Hồng Hà' AS detail2
UNION ALL
SELECT 'Xoài cát Hòa Lộc', 'food', 'TK14', 4000.00, 15.000, 0.300,
 'Vườn trái cây Đồng Tháp', NULL, 'Việt Nam',
 'Trọng lượng-300g/quả' AS info1, 'Loại-Xoài bán theo cân' AS info2,
 'Chất lượng-Xoài cát Hòa Lộc ngọt thơm' AS detail1, 'Tính tiền-(khối lượng cart ÷ 0.300) × 4000đ' AS detail2
UNION ALL
SELECT 'Album nhựa đựng giấy A4', 'stationery', 'ND18', 15000.00, 999.000, 0.000,
 'Thiên Long FlexOffice', NULL, 'Việt Nam',
 'Số lá-20' AS info1, 'Khổ-A4' AS info2,
 'Loại-Bìa nhiều lá clear book hàn siêu âm bền trong' AS detail1, 'Công dụng-Dùng lưu hồ sơ/tài liệu' AS detail2
UNION ALL
SELECT 'Kẹo dẻo hương cam', 'food', 'TK14', 250.00, 10.000, 0.025,
 'Mondelez International', NULL, 'Việt Nam',
 'Trọng lượng-25g/viên' AS info1, 'Loại-Kẹo dẻo bán theo cân' AS info2,
 'Vị-Hương cam tự nhiên đậm đà' AS detail1, 'Tính tiền-(khối lượng cart ÷ 0.025) × 250đ' AS detail2
UNION ALL
SELECT 'Hộp ruột bút bi nước M&G', 'stationery', 'ND18', 35000.00, 999.000, 0.000,
 'Shanghai M&G Stationery', NULL, 'Trung Quốc',
 'Cỡ ngòi-0.7mm' AS info1, 'Quy cách-Hộp 20 ruột gel' AS info2,
 'Chất lượng-Ruột bút gel M&G trơn mượt kim 0.7mm' AS detail1, 'Tương thích-Phù hợp nhiều dòng bút gel M&G' AS detail2

-- Sản phẩm 21-30  
UNION ALL
SELECT 'Nước suối Lavie', 'drink', 'QL10', 5000.00, 999.000, 0.000,
 'Lavie Việt Nam', NULL, 'Việt Nam',
 'Dung tích-500ml' AS info1, 'Loại-Nước suối tinh khiết' AS info2,
 'Chất lượng-Nước suối thiên nhiên an toàn' AS detail1, 'Đóng gói-Chai nhựa tái chế' AS detail2
UNION ALL
SELECT 'Bánh quy Oreo', 'food', 'TK14', 12000.00, 999.000, 0.000,
 'Mondelez International', NULL, 'Việt Nam',
 'Khối lượng-137g' AS info1, 'Loại-Bánh quy sandwich' AS info2,
 'Vị-Kem vani giữa hai bánh quy socola' AS detail1, 'Cách dùng-Ăn trực tiếp hoặc chấm sữa' AS detail2
UNION ALL
SELECT 'Thịt heo xay đông lạnh', 'food', 'TK14', 12000.00, 8.000, 1.000,
 'CP Foods Việt Nam', NULL, 'Việt Nam',
 'Trọng lượng-1kg/gói' AS info1, 'Loại-Thịt heo bán theo cân' AS info2,
 'Chất lượng-Thịt heo tươi xay nhuyễn đông lạnh' AS detail1, 'Tính tiền-(khối lượng cart ÷ 1.000) × 12000đ' AS detail2
UNION ALL
SELECT 'Dầu gội Head & Shoulders', 'household', 'TH36', 89000.00, 999.000, 0.000,
 'Procter & Gamble', NULL, 'Việt Nam',
 'Dung tích-400ml' AS info1, 'Loại-Dầu gội trị gàu' AS info2,
 'Tác dụng-Ngăn ngừa gàu và nuôi dưỡng tóc' AS detail1, 'Hương-Menthol mát lạnh' AS detail2
UNION ALL
SELECT 'Kẹo Chupa Chups', 'food', 'TK14', 3000.00, 999.000, 0.000,
 'Perfetti Van Melle', NULL, 'Tây Ban Nha',
 'Khối lượng-12g' AS info1, 'Loại-Kẹo mút có que' AS info2,
 'Vị-Đa dạng hương vị trái cây' AS detail1, 'Đóng gói-Từng cái riêng lẻ' AS detail2
UNION ALL
SELECT 'Ổi xanh Việt Nam', 'food', 'TK14', 1200.00, 40.000, 0.250,
 'Nông trại Việt Nam', NULL, 'Việt Nam',
 'Trọng lượng-250g/quả' AS info1, 'Loại-Ổi bán theo cân' AS info2,
 'Chất lượng-Ổi xanh giòn ngọt tự nhiên' AS detail1, 'Tính tiền-(khối lượng cart ÷ 0.250) × 1200đ' AS detail2
UNION ALL
SELECT 'Tã Pampers Baby Dry', 'household', 'TH36', 189000.00, 999.000, 0.000,
 'Procter & Gamble', NULL, 'Việt Nam',
 'Số lượng-68 miếng' AS info1, 'Size-Newborn 0-5kg' AS info2,
 'Tính năng-Thấm hút tối đa 12 tiếng khô thoáng' AS detail1, 'Chất liệu-Cotton mềm mại an toàn' AS detail2
UNION ALL
SELECT 'Bút bi Thiên Long', 'stationery', 'ND18', 3000.00, 999.000, 0.000,
 'Thiên Long Group', NULL, 'Việt Nam',
 'Loại mực-Gel xanh' AS info1, 'Cỡ ngòi-0.5mm' AS info2,
 'Chất lượng-Viết mượt không lem mực' AS detail1, 'Thiết kế-Thân bút trong suốt tiện lợi' AS detail2
UNION ALL
SELECT 'Coca Cola', 'drink', 'QL10', 15000.00, 999.000, 0.000,
 'Coca Cola Việt Nam', NULL, 'Việt Nam',
 'Dung tích-330ml' AS info1, 'Loại-Nước ngọt có gas' AS info2,
 'Vị-Coca Cola truyền thống đậm đà' AS detail1, 'Cách dùng-Uống lạnh ngon hơn' AS detail2
UNION ALL
SELECT 'Bánh tráng nướng', 'food', 'TK14', 8000.00, 999.000, 0.000,
 'Bánh tráng Tây Ninh', NULL, 'Việt Nam',
 'Khối lượng-200g' AS info1, 'Loại-Bánh tráng nướng giòn' AS info2,
 'Vị-Mặn ngọt đậm đà truyền thống' AS detail1, 'Cách dùng-Ăn trực tiếp hoặc kèm tương ớt' AS detail2

-- Sản phẩm 31-40
UNION ALL
SELECT 'Pepsi', 'drink', 'QL10', 15000.00, 999.000, 0.000,
 'PepsiCo Việt Nam', NULL, 'Việt Nam',
 'Dung tích-330ml' AS info1, 'Loại-Nước ngọt có gas' AS info2,
 'Vị-Pepsi cola mát lạnh sảng khoái' AS detail1, 'Đóng gói-Lon nhôm tái chế' AS detail2
UNION ALL
SELECT 'Xúc xích Vienna', 'food', 'TK14', 45000.00, 999.000, 0.000,
 'Vissan', NULL, 'Việt Nam',
 'Khối lượng-500g' AS info1, 'Loại-Xúc xích đóng hộp' AS info2,
 'Chất lượng-Xúc xích Vienna cao cấp đậm đà' AS detail1, 'Cách dùng-Chế biến đa dạng món ăn' AS detail2
UNION ALL
SELECT 'Dẻo chua ngọt', 'food', 'TK14', 150.00, 20.000, 0.015,
 'Hải Hà Confectionery', NULL, 'Việt Nam',
 'Trọng lượng-15g/viên' AS info1, 'Loại-Kẹo dẻo bán theo cân' AS info2,
 'Vị-Chua ngọt tự nhiên đậm đà' AS detail1, 'Tính tiền-(khối lượng cart ÷ 0.015) × 150đ' AS detail2
UNION ALL
SELECT 'Khăn giấy Kleenex', 'household', 'TH36', 23000.00, 999.000, 0.000,
 'Kimberly-Clark', NULL, 'Việt Nam',
 'Số tờ-200 tờ' AS info1, 'Loại-Khăn giấy mềm mại' AS info2,
 'Chất lượng-Khăn giấy 3 lớp siêu thấm hút' AS detail1, 'Công dụng-Đa năng cho gia đình' AS detail2
UNION ALL
SELECT 'Snack Pringles', 'food', 'TK14', 45000.00, 999.000, 0.000,
 'Pringles Company', NULL, 'Malaysia',
 'Khối lượng-107g' AS info1, 'Loại-Snack khoai tây hộp' AS info2,
 'Vị-Original truyền thống giòn tan' AS detail1, 'Đóng gói-Hộp thiếc tiện lợi bảo quản' AS detail2
UNION ALL
SELECT 'Rau muống Đà Lạt', 'food', 'TK14', 800.00, 25.000, 0.500,
 'Nông trại Đà Lạt', NULL, 'Việt Nam',
 'Trọng lượng-500g/bó' AS info1, 'Loại-Rau xanh bán theo cân' AS info2,
 'Chất lượng-Rau muống tươi xanh sạch VietGAP' AS detail1, 'Tính tiền-(khối lượng cart ÷ 0.500) × 800đ' AS detail2
UNION ALL
SELECT 'Bánh Chocopie', 'food', 'TK14', 28000.00, 999.000, 0.000,
 'Orion Việt Nam', NULL, 'Việt Nam',
 'Khối lượng-330g' AS info1, 'Loại-Bánh marshmallow phủ socola' AS info2,
 'Vị-Marshmallow mềm phủ socola đậm đà' AS detail1, 'Quy cách-Hộp 12 cái tiện lợi' AS detail2
UNION ALL
SELECT 'Detergent OMO', 'household', 'TH36', 125000.00, 999.000, 0.000,
 'Unilever Việt Nam', NULL, 'Việt Nam',
 'Khối lượng-4.1kg' AS info1, 'Loại-Bột giặt enzyme' AS info2,
 'Tác dụng-Giặt sạch vết bẩn cứng đầu hiệu quả' AS detail1, 'Hương-Hương hoa tươi mát' AS detail2
UNION ALL
SELECT 'Sting dâu', 'drink', 'QL10', 10000.00, 999.000, 0.000,
 'PepsiCo Việt Nam', NULL, 'Việt Nam',
 'Dung tích-330ml' AS info1, 'Loại-Nước tăng lực' AS info2,
 'Vị-Hương dâu tươi mát có gas' AS detail1, 'Tác dụng-Bổ sung năng lượng và vitamin' AS detail2
UNION ALL
SELECT 'Khoai lang Nhật Bản', 'food', 'TK14', 3500.00, 12.000, 0.600,
 'Farm Việt Nhật', NULL, 'Việt Nam',
 'Trọng lượng-600g/củ' AS info1, 'Loại-Khoai lang bán theo cân' AS info2,
 'Chất lượng-Khoai lang Nhật ngọt bùi tự nhiên' AS detail1, 'Tính tiền-(khối lượng cart ÷ 0.600) × 3500đ' AS detail2
UNION ALL
SELECT 'Latte socola', 'drink', 'QL10', 15000.00, 999.000, 0.000,
 'Nestlé (NESCAFÉ RTD)', NULL, 'Thái Lan',
 'Dung tích-180ml', 'Dòng-Cà phê sữa lon',
 'NESCAFÉ Latte vị socola/mocha uống liền', 'Ngon hơn khi dùng lạnh'
UNION ALL
SELECT 'Kẹo dẻo trái cây', 'food', 'TK14', 500.00, 5.000, 0.020,
 'Mondelez International', NULL, 'Việt Nam',
 'Khối lượng-20g/viên', 'Loại-Kẹo dẻo bán theo cân',
 'Kẹo dẻo nhiều vị trái cây; bán theo cân', 'Giá 500đ/viên 20g - khách mua theo khối lượng'
UNION ALL
SELECT 'Bánh xà phòng Lifebuoy xanh nước biển', 'household', 'TH36', 12000.00, 999.000, 0.000,
 'Unilever Việt Nam (Lifebuoy)', NULL, 'Việt Nam',
 'Khối lượng-90g', 'Dòng-Cool Fresh/Protection 10',
 'Xà phòng thỏi mát sạch; loại bỏ 99.9% vi khuẩn (theo hãng)', 'Phù hợp nhiều loại da'
UNION ALL
SELECT 'Bàn chải Suwadee', 'household', 'TH36', 45000.00, 999.000, 0.000,
 'Hoa Thái Toothbrush (Suwadee)', NULL, 'Việt Nam',
 'Quy cách-Hộp 18 cây', 'Lông-Siêu mịn',
 'Bàn chải đánh răng thương hiệu Suwadee', 'Dòng cho người lớn'
UNION ALL
SELECT 'Kem đánh răng', 'household', 'TH36', 25000.00, 999.000, 0.000,
 NULL, NULL, NULL,
 'Khối lượng-180g', 'Loại-Chăm sóc răng miệng',
 'Mục hàng tổng quát, cần chọn nhãn cụ thể để bổ sung', 'Sẽ cập nhật thành phần/nhà sx sau'
UNION ALL
SELECT 'Vở Hồng Hà', 'stationery', 'ND18', 8000.00, 999.000, 0.000,
 'Công ty CP Văn phòng phẩm Hồng Hà', NULL, 'Việt Nam',
 'Số trang-80', 'Kích thước-170x240mm',
 'Vở 4 ô ly/ghi chép; giấy 100 g/m²; viết êm', 'Phù hợp học sinh – in thương hiệu Hồng Hà'
UNION ALL
SELECT 'ALBUM nhựa đựng giấy A4', 'stationery', 'ND18', 15000.00, 999.000, 0.000,
 'Thiên Long – FlexOffice (FO-DB01)', NULL, 'Việt Nam',
 'Số lá-20', 'Khổ-A4',
 'Bìa nhiều lá (clear book) hàn siêu âm; bền, trong', 'Dùng lưu hồ sơ/tài liệu'
UNION ALL
SELECT 'Hộp ruột bút bi nước M&G', 'stationery', 'ND18', 35000.00, 999.000, 0.000,
 'Shanghai M&G Stationery Inc.', NULL, 'Trung Quốc',
 'Cỡ ngòi-0.7mm', 'Quy cách-Hộp 20 ruột gel',
 'Ruột bút gel M&G trơn mượt; kim 0.7mm', 'Phù hợp nhiều dòng bút gel M&G'
UNION ALL
SELECT 'Táo Gala Việt Nam', 'food', 'TK14', 1500.00, 100.000, 0.150,
 'Nông trại Đà Lạt', NULL, 'Việt Nam',
 'Khối lượng-150g/quả', 'Loại-Táo bán theo cân',
 'Táo Gala tươi ngon bán theo cân; giá 1500đ/quả 150g', 'Tính tiền: (khối lượng trong cart ÷ 0.150) × 1500đ'
UNION ALL
SELECT 'Chuối sứ Lào Cai', 'food', 'TK14', 800.00, 50.000, 0.100,
 'Hợp tác xã Lào Cai', NULL, 'Việt Nam',
 'Khối lượng-100g/quả', 'Loại-Chuối bán theo cân',
 'Chuối sứ ngọt tự nhiên bán theo cân; giá 800đ/quả 100g', 'Tính tiền: (khối lượng trong cart ÷ 0.100) × 800đ'
UNION ALL
SELECT 'Kẹo dẻo hương cam', 'food', 'TK14', 250.00, 10.000, 0.025,
 'Mondelez International', NULL, 'Việt Nam',
 'Khối lượng-25g/viên', 'Loại-Kẹo dẻo bán theo cân',
 'Kẹo dẻo hương cam bán theo cân; giá 250đ/viên 25g', 'Tính tiền: (khối lượng trong cart ÷ 0.025) × 250đ'
) AS temp_products
WHERE NOT EXISTS (SELECT 1 FROM product_master LIMIT 1);
