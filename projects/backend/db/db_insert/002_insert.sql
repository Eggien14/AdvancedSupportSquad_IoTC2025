-- Thêm dữ liệu mẫu cho product_master (UTF8MB4)
-- Cột: product_name, product_type, area, price, manufacturer, expiry_or_mfg_date, origin, info1, info2, detail1, detail2
USE iotc25_advanced_support_squad;
INSERT INTO product_master
(product_name, product_type, area, price, manufacturer, expiry_or_mfg_date, origin, info1, info2, detail1, detail2)
VALUES
-- -------- FOOD @ TK14 --------
('Mỳ Hảo Hảo mì xào tôm chua', 'food', 'TK14', 0.00,
 'Acecook Việt Nam', NULL, 'Việt Nam',
 'Khối lượng-75g', 'Phong cách-Mì xào khô',
 'Vị tôm chua ngọt; sợi mì dai; chế biến kiểu xào khô', 'Dùng: chắt nước, trộn sốt'),
('Bim bim POCA gà quay da giòn', 'food', 'TK14', 0.00,
 'PepsiCo Vietnam (POCA/Lay’s)', NULL, 'Việt Nam',
 'Khối lượng-65g', 'Loại-Snack khoai tây',
 'Vị gà quay da giòn; gói ăn liền', 'Bao bì gói lẻ tiện dụng'),
('Bim bim Oishi snack bắp ngọt', 'food', 'TK14', 0.00,
 'Liwayway Việt Nam (Oishi)', NULL, 'Việt Nam',
 'Khối lượng-110g', 'Loại-Snack bắp',
 'Snack bắp ngọt giòn xốp', 'Gói 110g phù hợp chia sẻ'),
('Bánh mỳ Kinh Đô vị lá dứa', 'food', 'TK14', 0.00,
 'Mondelez Kinh Đô Việt Nam', NULL, 'Việt Nam',
 'Khối lượng-40g', 'Dòng-Bánh mì tươi ổ ngắn',
 'Ổ ngắn vị lá dứa; vỏ mềm; nhân kem', 'Bữa sáng tiện lợi'),

-- -------- DRINK @ QL10 --------
('Bia Tiger xanh', 'drink', 'QL10', 0.00,
 'Heineken Vietnam (Tiger Beer)', NULL, 'Việt Nam',
 'Dung tích-330ml', 'Quy cách-Lon/chai 330ml',
 'Bia lager Tiger truyền thống (“xanh”)', 'Đóng gói thùng 24 lon/chai theo SKU'),
('Sữa Milo lốc 4 hộp', 'drink', 'QL10', 0.00,
 'Nestlé Việt Nam (MILO)', NULL, 'Việt Nam',
 'Thể tích-180ml x4', 'Dòng-UHT lúa mạch',
 'MILO UHT bổ sung Protomalt, canxi, vitamin', 'Ngon hơn khi uống lạnh'),
('C2 vàng', 'drink', 'QL10', 0.00,
 'URC Việt Nam (C2)', NULL, 'Việt Nam',
 'Dung tích-455ml', 'Hương-Chanh (nhãn vàng)',
 'Trà xanh đóng chai vị chanh', 'Đóng thùng 24 chai theo SKU'),
('Latte socola', 'drink', 'QL10', 0.00,
 'Nestlé (NESCAFÉ RTD)', NULL, 'Thái Lan',
 'Dung tích-180ml', 'Dòng-Cà phê sữa lon',
 'NESCAFÉ Latte vị socola/mocha uống liền', 'Ngon hơn khi dùng lạnh'),

-- -------- HOUSEHOLD @ TH36 --------
('Bánh xà phòng Lifebuoy xanh nước biển', 'household', 'TH36', 0.00,
 'Unilever Việt Nam (Lifebuoy)', NULL, 'Việt Nam',
 'Khối lượng-90g', 'Dòng-Cool Fresh/Protection 10',
 'Xà phòng thỏi mát sạch; loại bỏ 99.9% vi khuẩn (theo hãng)', 'Phù hợp nhiều loại da'),
('Bàn chải Suwadee', 'household', 'TH36', 0.00,
 'Hoa Thái Toothbrush (Suwadee)', NULL, 'Việt Nam',
 'Quy cách-Hộp 18 cây', 'Lông-Siêu mịn',
 'Bàn chải đánh răng thương hiệu Suwadee', 'Dòng cho người lớn'),
('Kem đánh răng', 'household', 'TH36', 0.00,
 NULL, NULL, NULL,
 'Khối lượng-180g', 'Loại-Chăm sóc răng miệng',
 'Mục hàng tổng quát, cần chọn nhãn cụ thể để bổ sung', 'Sẽ cập nhật thành phần/nhà sx sau'),

-- -------- STATIONERY @ ND18 --------
('Vở Hồng Hà', 'stationery', 'ND18', 0.00,
 'Công ty CP Văn phòng phẩm Hồng Hà', NULL, 'Việt Nam',
 'Số trang-80', 'Kích thước-170x240mm',
 'Vở 4 ô ly/ghi chép; giấy 100 g/m²; viết êm', 'Phù hợp học sinh – in thương hiệu Hồng Hà'),
('ALBUM nhựa đựng giấy A4', 'stationery', 'ND18', 0.00,
 'Thiên Long – FlexOffice (FO-DB01)', NULL, 'Việt Nam',
 'Số lá-20', 'Khổ-A4',
 'Bìa nhiều lá (clear book) hàn siêu âm; bền, trong', 'Dùng lưu hồ sơ/tài liệu'),
('Hộp ruột bút bi nước M&G', 'stationery', 'ND18', 0.00,
 'Shanghai M&G Stationery Inc.', NULL, 'Trung Quốc',
 'Cỡ ngòi-0.7mm', 'Quy cách-Hộp 20 ruột gel',
 'Ruột bút gel M&G trơn mượt; kim 0.7mm', 'Phù hợp nhiều dòng bút gel M&G');