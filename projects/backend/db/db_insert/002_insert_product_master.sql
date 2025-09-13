-- Test file: Thêm dữ liệu mẫu cho product_master (UTF8MB4) - CHỈ KHI BẢNG TRỐNG
-- Cột: product_name, product_type, area, price, quantity, weight_kg, manufacturer, expiry_or_mfg_date, origin, info1, info2, detail1, detail2
USE iotc25_advanced_support_squad;

-- Set charset đúng cho session
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Chỉ insert nếu bảng product_master trống
INSERT INTO product_master
(product_name, product_type, area, price, quantity, weight_kg, manufacturer, expiry_or_mfg_date, origin, info1, info2, detail1, detail2)
SELECT * FROM (
SELECT 'Staff Raisin Sponge Cake' AS product_name, 
       'food' AS product_type, 
       'A1' AS area, 
       6000.00 AS price, 
       3.000 AS quantity, 
       0.000 AS weight_kg,
       'Hữu Nghị Bakery' AS manufacturer, 
       '2025-12-14' AS expiry_or_mfg_date, 
       'Vietnam' AS origin,
       'Net weight-38g' AS info1, 
       'Energy-142 Kcal' AS info2,
       'Flavor-Soft, mild sweetness with raisin filling' AS detail1, 
       'Benefit-A nutritious and energizing meal' AS detail2
UNION ALL
SELECT 'Cal Cheese Biscuit', 
       'food', 
       'A1', 
       5500.00, 
       3.000, 
       0.000, 
       'Mayora Vietnam', 
       '2025-12-14', 
       'Indonesia', 
       'Net weight-48g', 
       'Energy-498 Kcal/100g', 
       'Flavor-Rich and delicious cheese flavor', 
       'Benefit-A light snack that supplements calcium'
UNION ALL
SELECT 'Lays Natural Potato Chips', 
       'food', 
       'A2', 
       6000.00, 
       2.000, 
       0.000, 
       'PepsiCo Vietnam', 
       '2025-12-14', 
       'Vietnam', 
       'Weight-30g', 
       'Energy-160 Kcal', 
       'Flavor-Delicious, crispy natural potato', 
       'Directions-Ready to eat, no cooking required'
UNION ALL
SELECT 'Hao Hao Stir-fried Noodles', 
       'food', 
       'A2', 
       4500.00, 
       4.000, 
       0.000,
       'Acecook', 
       '2025-12-14', 
       'Vietnam',
       'Net weight-75g', 
       'Style-Dry stir-fried noodles',
       'HFlavor-Sweet and sour shrimp', 
       'Directions-Drain after 3 minutes, then mix well with seasoning'
UNION ALL
SELECT 'Alpenliebe Caramel Candy', 
       'food', 
       'A3', 
       50000.00, 
       999.000, 
       50.000, 
       'Perfetti Van Melle', 
       '2025-12-14', 
       'Việt Nam', 
       'Price-50,000 VND/kg', 
       'Type-Hard caramel candy', 
       'Flavor-Sweet and creamy caramel', 
       'Benefit-A snack, supplements some nutrients good for the body'
UNION ALL
SELECT 'Milo Milk (4-box pack)',
       'drink',
       'A1',
       30000.00,
       2.00,
       0.000,
       'Nestlé',
       '2025-12-14',
       'Việt Nam',
       'Volume-180ml/box',
       'Type-Malted milk',
       'Energy-110 Kcal/180ml',
       'Benefit-Rich in calcium, helps with body development'
UNION ALL
SELECT 'C2 Lemon Green Tea', 
       'drink', 
       'A2', 
       8800.00, 
       2.00, 
       0.000, 
       'URC Vietnam', 
       '2025-12-14', 
       'Vietnam', 
       'Volume-360ml', 
       'Tea type-Lemon green tea', 
       'Energy-33-61kcal/100ml', 
       'Directions-Shake well before drinking, tastes better when chilled'
UNION ALL
SELECT 'Chocolate Milk Latte', 
       'drink', 
       'A3', 
       10000.00, 
       3.00, 
       0.000, 
       'Kirin Vietnam Beverage Co., Ltd', 
       '2025-12-14', 
       'Vietnam', 
       'Volume-440ml', 
       'Flavor-Creamy, mild sweetness, rich chocolate milk flavor', 
       'Feature-Delicious, convenient, suitable for quenching thirst, supplementing energy', 
       'Directions-Shake well before drinking, tastes better when chilled'
UNION ALL
SELECT 'Staples Stapler Box', 
       'stationery', 
       'C1', 
       8000.00, 
       3.000, 
       0.000,
       'Shanghai M&G Stationery Inc.', 
       '2025-12-14', 
       'China',
       'Staple type-Large', 
       'Material-Iron alloy, aluminum',
       'Durability-High', 
       'Quantity-20 strips/box'
UNION ALL
SELECT 'Spiral Notebook', 
       'stationery', 
       'C2', 
       27000.00, 
       2.000, 
       0.000,
       'Hong Ha', 
       '2025-12-14', 
       'Vietnam',
       'Number of pages-200 pages including cover', 
       'Paper-Ruled', 
       'Size-A6', 
       'Design-Unique, eye-catching, with a fragrance effect when rubbed on the surface'
UNION ALL
SELECT 'Muji Gel Pen Box', 
       'stationery', 
       'C3', 
       62000.00, 
       2.000, 
       0.000,
       'Muji', 
       '2025-12-14', 
       'China',
       'Quantity-20 pens/box', 
       'Ink color-Blue',
       'Design-Special, easy to replace refill', 
       'Writing-Smooth'
UNION ALL
SELECT 'Colgate Toothpaste', 
       'household', 
       'D1', 
       32000.00, 
       2.000, 
       0.000,
       'Colgate', 
       '2025-12-14', 
       'Vietnam',
       'Weight-180g', 
       'Flavor-Green tea',
       'Features-Fresh crystals, excellent cavity protection', 
       'Directions-Use at least 1g per use, 2 times a day'
UNION ALL
SELECT 'Lifebuoy Soap Bar', 
       'household', 
       'D2', 
       12000.00, 
       3.000, 
       0.000,
       'Lifebuoy', 
       '2025-12-14', 
       'Vietnam',
       'Weight-90g', 
       'Features-Protects against disease-causing germs', 
       'How to use-For bathing and handwashing', 
       'Storage-Store in a dry place, away from high temperatures'
UNION ALL
SELECT 'Suwadee Toothbrush', 
       'household', 
       'D3', 
       20000.00, 
       4.000, 
       0.000,
       'Suwadee', 
       '2025-12-14', 
       'Vietnam',
       'Ingredients-PP, TPE, PBT', 
       'Features-Toothbrush for adults and children, soft bristles',
       'How to use-Use with a moderate amount of toothpaste, brush after every meal',
       'Storage-Store in a cool, dry place'
UNION ALL
SELECT 'Muji Jar Scented Candle', 
       'household', 
       'D3', 
       36000.00, 
       2.000, 
       0.000,
       'Muji', 
       '2025-12-14', 
       'Japan',
       'Scent-Gardenia', 
       'Features-Long-lasting, deep fragrance',
       'How to use-Open the lid and light the wick directly', 
       'Burn time-50 hours'
UNION ALL
SELECT 'Vietnamese Gala Apple', 'food', 'A1', 1500.00, 100.000, 0.150,
 'Da Lat Farm', NULL, 'Vietnam',
 'Weight-150g/fruit' AS info1, 'Type-Apple sold by weight' AS info2,
 'Quality-Natural fresh Gala Apple' AS detail1, 'Calculation-(cart weight ÷ 0.150) × 1500 VND' AS detail2
UNION ALL
SELECT 'POCA Crispy Roasted Chicken Snack', 'food', 'A1', 4500.00, 999.000, 0.000,
 'PepsiCo Vietnam', NULL, 'Vietnam',
 'Weight-65g' AS info1, 'Type-Potato snack' AS info2,
 'Flavor-Rich crispy roasted chicken' AS detail1, 'Packaging-Convenient individual pack' AS detail2
UNION ALL
SELECT 'Lao Cai Siamese Banana', 'food', 'A1', 800.00, 50.000, 0.100,
 'Lao Cai Cooperative', NULL, 'Vietnam',
 'Weight-100g/fruit' AS info1, 'Type-Banana sold by weight' AS info2,
 'Quality-Naturally sweet Siamese Banana' AS detail1, 'Calculation-(cart weight ÷ 0.100) × 800 VND' AS detail2
UNION ALL
SELECT 'Kinh Do Pandan Flavor Bread', 'food', 'A2', 8000.00, 999.000, 0.000,
 'Mondelez Kinh Do Vietnam', NULL, 'Vietnam',
 'Weight-40g' AS info1, 'Line-Short loaf fresh bread' AS info2,
 'Flavor-Pandan with soft crust and cream filling' AS detail1, 'Use-Convenient breakfast' AS detail2
UNION ALL
SELECT 'Fruit Gummy Candy', 'food', 'A2', 500.00, 5.000, 0.020,
 'Mondelez International', NULL, 'Vietnam',
 'Weight-20g/piece' AS info1, 'Type-Gummy candy sold by weight' AS info2,
 'Flavor-Various natural fruit flavors' AS detail1, 'Calculation-(cart weight ÷ 0.020) × 500 VND' AS detail2
UNION ALL
SELECT 'Tiger Green Beer', 'drink', 'B1', 12000.00, 999.000, 0.000,
 'Heineken Vietnam', NULL, 'Vietnam',
 'Volume-330ml' AS info1, 'Format-330ml Can/Bottle' AS info2,
 'Type-Traditional Tiger lager beer' AS detail1, 'Packaging-Case of 24 cans/bottles' AS detail2
UNION ALL
SELECT 'Hoa Binh Sanh Orange', 'food', 'A3', 2500.00, 30.000, 0.200,
 'Hoa Binh Farm', NULL, 'Vietnam',
 'Weight-200g/fruit' AS info1, 'Type-Orange sold by weight' AS info2,
 'Quality-Naturally sweet Sanh Orange' AS detail1, 'Calculation-(cart weight ÷ 0.200) × 2500 VND' AS detail2
UNION ALL
SELECT 'Ninh Thuan Green Grape', 'food', 'A3', 3000.00, 20.000, 0.500,
 'Ninh Thuan Fruit Depot', NULL, 'Vietnam',
 'Weight-500g/bunch' AS info1, 'Type-Grape sold by weight' AS info2,
 'Quality-Naturally sweet and cool green grape' AS detail1, 'Calculation-(cart weight ÷ 0.500) × 3000 VND' AS detail2
UNION ALL
SELECT 'Hong Ha Notebook', 'stationery', 'C1', 8000.00, 999.000, 0.000,
 'Hong Ha Stationery Joint Stock Company', NULL, 'Vietnam',
 'Page Count-80' AS info1, 'Size-170x240mm' AS info2,
 'Type-4-square-ruled/Writing 100 gsm smooth paper notebook' AS detail1, 'Target-Suitable for students branded Hong Ha' AS detail2
UNION ALL
SELECT 'Hoa Loc Sand Mango', 'food', 'A3', 4000.00, 15.000, 0.300,
 'Dong Thap Fruit Garden', NULL, 'Vietnam',
 'Weight-300g/fruit' AS info1, 'Type-Mango sold by weight' AS info2,
 'Quality-Sweet and fragrant Hoa Loc Sand Mango' AS detail1, 'Calculation-(cart weight ÷ 0.300) × 4000 VND' AS detail2
UNION ALL
SELECT 'A4 Plastic Paper Album', 'stationery', 'C2', 15000.00, 999.000, 0.000,
 'Thien Long FlexOffice', NULL, 'Vietnam',
 'Number of Sheets-20' AS info1, 'Format-A4' AS info2,
 'Type-Durable clear book with ultrasonic-welded leaves' AS detail1, 'Use-For storing files/documents' AS detail2
UNION ALL
SELECT 'Orange Flavor Gummy Candy', 'food', 'A2', 250.00, 10.000, 0.025,
 'Mondelez International', NULL, 'Vietnam',
 'Weight-25g/piece' AS info1, 'Type-Gummy candy sold by weight' AS info2,
 'Flavor-Rich natural orange flavor' AS detail1, 'Calculation-(cart weight ÷ 0.025) × 250 VND' AS detail2
UNION ALL
SELECT 'M&G Water Ballpoint Refill Box', 'stationery', 'C2', 35000.00, 999.000, 0.000,
 'Shanghai M&G Stationery', NULL, 'China',
 'Nib size-0.7mm' AS info1, 'Format-Box of 20 gel refills' AS info2,
 'Quality-Smooth M&G gel refill 0.7mm tip' AS detail1, 'Compatibility-Fits many M&G gel pen lines' AS detail2
UNION ALL
SELECT 'Lavie Spring Water', 'drink', 'B3', 5000.00, 999.000, 0.000,
 'Lavie Vietnam', NULL, 'Vietnam',
 'Volume-500ml' AS info1, 'Type-Purified spring water' AS info2,
 'Quality-Safe natural spring water' AS detail1, 'Packaging-Recyclable plastic bottle' AS detail2
UNION ALL
SELECT 'Oreo Cookies', 'food', 'A1', 12000.00, 999.000, 0.000,
 'Mondelez International', NULL, 'Vietnam',
 'Weight-137g' AS info1, 'Type-Sandwich cookie' AS info2,
 'Flavor-Vanilla cream between two chocolate cookies' AS detail1, 'Usage-Eat directly or dip in milk' AS detail2
UNION ALL
SELECT 'Frozen Ground Pork', 'food', 'A2', 12000.00, 8.000, 1.000,
 'CP Foods Vietnam', NULL, 'Vietnam',
 'Weight-1kg/pack' AS info1, 'Type-Pork sold by weight' AS info2,
 'Quality-Freshly ground frozen pork' AS detail1, 'Calculation-(cart weight ÷ 1.000) × 12000 VND' AS detail2
UNION ALL
SELECT 'Head & Shoulders Shampoo', 'household', 'D1', 89000.00, 999.000, 0.000,
 'Procter & Gamble', NULL, 'Vietnam',
 'Volume-400ml' AS info1, 'Type-Anti-dandruff shampoo' AS info2,
 'Effect-Prevents dandruff and nourishes hair' AS detail1, 'Scent-Cool Menthol' AS detail2
UNION ALL
SELECT 'Chupa Chups Candy', 'food', 'A2', 3000.00, 999.000, 0.000,
 'Perfetti Van Melle', NULL, 'Spain',
 'Weight-12g' AS info1, 'Type-Lollipop on a stick' AS info2,
 'Flavor-Diverse fruit flavors' AS detail1, 'Packaging-Individually wrapped' AS detail2
UNION ALL
SELECT 'Vietnamese Green Guava', 'food', 'A1', 1200.00, 40.000, 0.250,
 'Vietnam Farm', NULL, 'Vietnam',
 'Weight-250g/fruit' AS info1, 'Type-Guava sold by weight' AS info2,
'Quality-Naturally crispy sweet green guava' AS detail1, 'Calculation-(cart weight ÷ 0.250) × 1200 VND' AS detail2
UNION ALL
SELECT 'Pampers Baby Dry Diapers', 'household', 'D2', 189000.00, 999.000, 0.000,
 'Procter & Gamble', NULL, 'Vietnam',
 'Quantity-68 pieces' AS info1, 'Size-Newborn 0-5kg' AS info2,
 'Feature-Maximum absorption for 12 hours dryness' AS detail1, 'Material-Soft and safe cotton' AS detail2
UNION ALL
SELECT 'Thien Long Ballpoint Pen', 'stationery', 'C1', 3000.00, 999.000, 0.000,
 'Thien Long Group', NULL, 'Vietnam',
 'Ink Type-Blue Gel' AS info1, 'Nib size-0.5mm' AS info2,
 'Quality-Smooth writing, non-smudging ink' AS detail1, 'Design-Convenient transparent barrel' AS detail2
UNION ALL
SELECT 'Coca Cola', 'drink', 'B1', 15000.00, 999.000, 0.000,
 'Coca Cola Vietnam', NULL, 'Vietnam',
 'Volume-330ml' AS info1, 'Type-Carbonated soft drink' AS info2,
 'Flavor-Rich traditional Coca Cola' AS detail1, 'Usage-Tastes better cold' AS detail2
UNION ALL
SELECT 'Grilled Rice Paper', 'food', 'A3', 8000.00, 999.000, 0.000,
 'Tay Ninh Rice Paper', NULL, 'Vietnam',
 'Weight-200g' AS info1, 'Type-Crispy grilled rice paper' AS info2,
 'Flavor-Rich traditional salty-sweet' AS detail1, 'Usage-Eat directly or with chili sauce' AS detail2
UNION ALL
SELECT 'Pepsi', 'drink', 'B2', 15000.00, 999.000, 0.000,
 'PepsiCo Vietnam', NULL, 'Vietnam',
 'Volume-330ml' AS info1, 'Type-Carbonated soft drink' AS info2,
 'Flavor-Cool refreshing Pepsi cola' AS detail1, 'Packaging-Recyclable aluminum can' AS detail2
UNION ALL
SELECT 'Vienna Sausage', 'food', 'A1', 45000.00, 999.000, 0.000,
 'Vissan', NULL, 'Vietnam',
 'Weight-500g' AS info1, 'Type-Canned sausage' AS info2,
 'Quality-Rich high-grade Vienna Sausage' AS detail1, 'Usage-Versatile for various dishes' AS detail2
UNION ALL
SELECT 'Sweet and Sour Gummy', 'food', 'A3', 150.00, 20.000, 0.015,
 'Hai Ha Confectionery', NULL, 'Vietnam',
 'Weight-15g/piece' AS info1, 'Type-Gummy candy sold by weight' AS info2,
 'Flavor-Rich natural sweet and sour' AS detail1, 'Calculation-(cart weight ÷ 0.015) × 150 VND' AS detail2
UNION ALL
SELECT 'Kleenex Tissues', 'household', 'D2', 23000.00, 999.000, 0.000,
 'Kimberly-Clark', NULL, 'Vietnam',
 'Sheet Count-200 sheets' AS info1, 'Type-Soft tissues' AS info2,
 'Quality-Super absorbent 3-ply tissues' AS detail1, 'Use-Multi-purpose for the family' AS detail2
UNION ALL
SELECT 'Pringles Snack', 'food', 'A1', 45000.00, 999.000, 0.000,
 'Pringles Company', NULL, 'Malaysia',
 'Weight-107g' AS info1, 'Type-Canned potato snack' AS info2,
 'Flavor-Crispy traditional Original' AS detail1, 'Packaging-Convenient resealable can' AS detail2
UNION ALL
SELECT 'Da Lat Water Spinach', 'food', 'A3', 800.00, 25.000, 0.500,
 'Da Lat Farm', NULL, 'Vietnam',
 'Weight-500g/bunch' AS info1, 'Type-Green vegetable sold by weight' AS info2,
 'Quality-Fresh, clean VietGAP water spinach' AS detail1, 'Calculation-(cart weight ÷ 0.500) × 800 VND' AS detail2
UNION ALL
SELECT 'Chocopie Cake', 'food', 'A2', 28000.00, 999.000, 0.000,
 'Orion Vietnam', NULL, 'Vietnam',
 'Weight-330g' AS info1, 'Type-Marshmallow cake coated with chocolate' AS info2,
 'Flavor-Soft marshmallow coated with rich chocolate' AS detail1, 'Format-Convenient box of 12 pieces' AS detail2
UNION ALL
SELECT 'OMO Detergent', 'household', 'D1', 125000.00, 999.000, 0.000,
 'Unilever Vietnam', NULL, 'Vietnam',
 'Weight-4.1kg' AS info1, 'Type-Enzyme laundry powder' AS info2,
 'Effect-Effectively cleans tough stains' AS detail1, 'Scent-Fresh floral scent' AS detail2
UNION ALL
SELECT 'Sting Strawberry', 'drink', 'B3', 10000.00, 999.000, 0.000,
 'PepsiCo Vietnam', NULL, 'Vietnam',
 'Volume-330ml' AS info1, 'Type-Energy drink' AS info2,
 'Flavor-Cool refreshing carbonated strawberry' AS detail1, 'Effect-Provides energy and vitamins' AS detail2
UNION ALL
SELECT 'Japanese Sweet Potato', 'food', 'A3', 3500.00, 12.000, 0.600,
 'Viet Nhat Farm', NULL, 'Vietnam',
 'Weight-600g/tuber' AS info1, 'Type-Sweet potato sold by weight' AS info2,
 'Quality-Naturally sweet and creamy Japanese sweet potato' AS detail1, 'Calculation-(cart weight ÷ 0.600) × 3500 VND' AS detail2
UNION ALL
SELECT 'Fruit Gummy Candy', 'food', 'A3', 500.00, 5.000, 0.020,
 'Mondelez International', NULL, 'Vietnam',
 'Weight-20g/piece', 'Type-Gummy candy sold by weight',
 'Multi-flavor fruit gummy candy; sold by weight', 'Price 500VND/20g piece - customer buys by weight'
UNION ALL
SELECT 'A4 Plastic Paper ALBUM', 'stationery', 'C2', 15000.00, 999.000, 0.000,
 'Thien Long – FlexOffice (FO-DB01)', NULL, 'Vietnam',
 'Number of Sheets-20', 'Format-A4',
 'Multi-leaf cover (clear book) ultrasonic-welded; durable, transparent', 'Used for storing files/documents'
UNION ALL
SELECT 'M&G Water Ballpoint Refill Box', 'stationery', 'C1', 35000.00, 999.000, 0.000,
 'Shanghai M&G Stationery Inc.', NULL, 'China',
 'Nib size-0.7mm', 'Format-Box of 20 gel refills',
 'Smooth M&G gel refill; 0.7mm tip', 'Compatible with many M&G gel pen lines'
UNION ALL
SELECT 'Vietnamese Gala Apple', 'food', 'A3', 1500.00, 100.000, 0.150,
 'Da Lat Farm', NULL, 'Vietnam',
 'Weight-150g/fruit', 'Type-Apple sold by weight',
 'Fresh Gala Apple sold by weight; price 1500VND/150g piece', 'Calculation: (cart weight ÷ 0.150) × 1500 VND'
UNION ALL
SELECT 'Lao Cai Siamese Banana', 'food', 'A2', 800.00, 50.000, 0.100,
 'Lao Cai Cooperative', NULL, 'Vietnam',
 'Weight-100g/fruit', 'Type-Banana sold by weight',
 'Naturally sweet Siamese Banana sold by weight; price 800VND/100g piece', 'Calculation: (cart weight ÷ 0.100) × 800 VND'
UNION ALL
SELECT 'Orange Flavor Gummy Candy', 'food', 'A2', 250.00, 10.000, 0.025,
 'Mondelez International', NULL, 'Vietnam',
 'Weight-25g/piece', 'Type-Gummy candy sold by weight',
 'Orange flavor gummy candy sold by weight; price 250VND/25g piece', 'Calculation: (cart weight ÷ 0.025) × 250 VND'
UNION ALL
SELECT 'Ô Long Tea Plus', 
       'drink', 
       'B1', 
       12000.00, 
       20.000, 
       0.000,
       'Tan Hiep Phat', 
       '2025-12-15', 
       'Vietnam',
       'Volume-350ml', 
       'Type-Oolong tea with jasmine',
       'Caffeine-Natural tea caffeine', 
       'Storage-Keep refrigerated after opening'
UNION ALL
SELECT 'Haribo gummy candy', 
       'food', 
       'A2', 
       8000.00, 
       25.000, 
       0.000,
       'Haribo', 
       '2025-11-30', 
       'Germany',
       'Net weight-80g', 
       'Flavor-Mixed fruit flavors',
       'Type-Gummy candy assorted', 
       'Ingredients-Glucose syrup, sugar, gelatin'
UNION ALL
SELECT 'Dasani Spring Water', 
       'drink', 
       'B2', 
       8000.00, 
       30.000, 
       0.000,
       'Coca Cola Vietnam', 
       '2026-01-15', 
       'Vietnam',
       'Volume-500ml', 
       'Type-Purified water',
       'Source-Processed natural water', 
       'Storage-Store in cool place'
UNION ALL
SELECT 'Oreo Cookies', 
       'food', 
       'A3', 
       15000.00, 
       12.000, 
       0.000,
       'Mondelez International', 
       '2025-11-25', 
       'Vietnam',
       'Net weight-137g', 
       'Flavor-Vanilla cream center',
       'Type-Chocolate sandwich cookies', 
       'Serving-Great with milk'
UNION ALL
SELECT 'Clear Men Shampoo', 
       'household', 
       'D1', 
       95000.00, 
       8.000, 
       0.000,
       'Unilever Vietnam', 
       '2026-03-10', 
       'Vietnam',
       'Volume-650ml', 
       'Type-Anti-dandruff shampoo',
       'Formula-Zinc Pyrithione active', 
       'Usage-For men, daily use'
UNION ALL
SELECT 'Thien Long 2B Pencil', 
       'stationery', 
       'C1', 
       3000.00, 
       50.000, 
       0.000,
       'Thiên Long Group', 
       '2026-12-31', 
       'Vietnam',
       'Hardness-2B grade', 
       'Material-Cedar wood body',
       'Feature-Smooth writing, easy to erase', 
       'Package-Individual pencil'
UNION ALL
SELECT 'Stabilo Legacy Eraser', 
       'stationery', 
       'C2', 
       5000.00, 
       40.000, 
       0.000,
       'Stabilo International', 
       '2026-12-31', 
       'Germany',
       'Size-Small eraser', 
       'Material-PVC-free rubber',
       'Feature-Clean erasing, no residue', 
       'Color-White with colored sleeve'
UNION ALL
SELECT 'Deli paper scissors', 
       'stationery', 
       'C3', 
       25000.00, 
       15.000, 
       0.000,
       'Deli Group', 
       '2026-12-31', 
       'China',
       'Size-6 inch scissors', 
       'Material-Stainless steel blades',
       'Feature-Sharp cutting, comfortable grip', 
       'Usage-For paper and light materials'
UNION ALL
SELECT 'Organic Cabbage', 
       'food', 
       'A1', 
       15000.00, 
       20.000, 
       0.300,
       'Dalat Organic Farm', 
       NULL, 
       'Vietnam',
       'Weight-300g bunch', 
       'Type-Organic bok choy',
       'Growing-Pesticide-free cultivation', 
       'Price-Per 300g bunch'
UNION ALL
SELECT 'Organic cherry tomatoes', 
       'food', 
       'A1', 
       25000.00, 
       15.000, 
       0.200,
       'Dalat Organic Farm', 
       NULL, 
       'Vietnam',
       'Weight-200g pack', 
       'Type-Organic cherry tomatoes',
       'Growing-Greenhouse cultivation', 
       'Price-Per 200g pack'
UNION ALL
SELECT 'Heineken beer can', 
       'drink', 
       'B1', 
       18000.00, 
       24.000, 
       0.000,
       'Heineken Vietnam', 
       '2025-12-31', 
       'Vietnam',
       'Volume-330ml can', 
       'Alcohol-5.0% vol',
       'Type-Premium lager beer', 
       'Storage-Keep in cool place'
UNION ALL
SELECT 'Chilean Red Wine', 
       'drink', 
       'B3', 
       220000.00, 
       2.000, 
       0.000,
       'Concha y Toro', 
       '2027-01-01', 
       'Chile',
       'Volume-750ml bottle', 
       'Alcohol-13.5% vol',
       'Type-Cabernet Sauvignon red wine', 
       'Storage-Store horizontally in cool place'
UNION ALL
SELECT '7UP soft drink', 
       'drink', 
       'B2', 
       12000.00, 
       18.000, 
       0.000,
       'PepsiCo Vietnam', 
       '2025-11-30', 
       'Vietnam',
       'Volume-330ml can', 
       'Flavor-Lemon-lime carbonated',
       'Type-Caffeine-free soft drink', 
       'Storage-Keep chilled for best taste'
UNION ALL
SELECT 'Tropicana Orange Juice', 
       'drink', 
       'B2', 
       35000.00, 
       10.000, 
       0.000,
       'PepsiCo International', 
       '2025-10-15', 
       'USA',
       'Volume-1L carton', 
       'Content-100% pure orange juice',
       'Type-No pulp orange juice', 
       'Storage-Refrigerate after opening'
UNION ALL
SELECT 'Faber-Castell 24 colored pencils', 
       'stationery', 
       'C2', 
       85000.00, 
       8.000, 
       0.000,
       'Faber-Castell', 
       '2026-12-31', 
       'Germany',
       'Quantity-24 colored pencils', 
       'Type-Classic colored pencils',
       'Quality-Rich pigments, smooth application', 
       'Package-Metal tin box'
UNION ALL
SELECT 'Casio FX-580VN Calculator', 
       'stationery', 
       'C3', 
       450000.00, 
       3.000, 
       0.000,
       'Casio Computer Co.', 
       '2026-12-31', 
       'Japan',
       'Functions-552 built-in functions', 
       'Display-Natural textbook display',
       'Features-Scientific calculator', 
       'Warranty-3 years manufacturer warranty'
UNION ALL
SELECT 'Sunlight dishwashing liquid', 
       'household', 
       'D1', 
       35000.00, 
       12.000, 
       0.000,
       'Unilever Vietnam', 
       '2026-06-30', 
       'Vietnam',
       'Volume-750ml bottle', 
       'Formula-Grease-cutting formula',
       'Scent-Lemon fresh fragrance', 
       'Usage-For dishes and cookware'
UNION ALL
SELECT 'Comfort Fabric Softener', 
       'household', 
       'D2', 
       55000.00, 
       8.000, 
       0.000,
       'Unilever Vietnam', 
       '2026-05-15', 
       'Vietnam',
       'Volume-1.6L bottle', 
       'Formula-Ultra concentrate',
       'Scent-Morning fresh fragrance', 
       'Benefit-Softens clothes, reduces static'
UNION ALL
SELECT 'Kleenex Tissues', 
       'household', 
       'D3', 
       25000.00, 
       15.000, 
       0.000,
       'Kimberly-Clark', 
       '2026-04-30', 
       'Vietnam',
       'Quantity-200 sheets/box', 
       'Type-2-ply facial tissues',
       'Feature-Soft and absorbent', 
       'Package-Convenient pop-up box'
UNION ALL
SELECT 'Oral-B Toothbrush', 
       'household', 
       'D1', 
       45000.00, 
       10.000, 
       0.000,
       'Procter & Gamble', 
       '2026-12-31', 
       'Germany',
       'Type-Manual toothbrush', 
       'Bristles-Medium firmness',
       'Feature-CrossAction bristles', 
       'Benefit-Superior plaque removal'
) AS temp_products
WHERE NOT EXISTS (SELECT 1 FROM product_master LIMIT 1);
