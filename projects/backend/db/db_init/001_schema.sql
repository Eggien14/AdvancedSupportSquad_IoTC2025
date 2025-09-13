CREATE DATABASE IF NOT EXISTS iotc25_advanced_support_squad
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE iotc25_advanced_support_squad;

-- Bảng 0: thông tin sản phẩm
CREATE TABLE IF NOT EXISTS product_master (
  product_id            INT AUTO_INCREMENT PRIMARY KEY,
  product_name          VARCHAR(255)        NOT NULL,
  product_type          VARCHAR(64)         NOT NULL,
  area                  VARCHAR(64)         NULL,
  price                 DECIMAL(10,2)       NOT NULL DEFAULT 0.00,
  quantity              DECIMAL(10,3)       NOT NULL DEFAULT 999.000 COMMENT 'Số lượng sản phẩm trong kho (decimal cho cả đơn vị và khối lượng)',
  weight_kg             DECIMAL(8,3)        NULL COMMENT 'Khối lượng thực tế (kg) - 0 = bán theo số lượng, >0 = bán theo cân',
  manufacturer          VARCHAR(128)        NULL,
  expiry_or_mfg_date    DATE                NULL,
  origin                VARCHAR(128)        NULL,
  info1                 VARCHAR(255)        NULL,
  info2                 VARCHAR(255)        NULL,
  detail1               VARCHAR(255)        NULL,
  detail2               VARCHAR(255)        NULL,
  created_at            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product_name (product_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng giỏ: mỗi cart + product là 1 dòng
CREATE TABLE IF NOT EXISTS cart_items (
  cart_id     BIGINT          NOT NULL,
  product_id  INT             NOT NULL,
  quantity    DECIMAL(10,3)   NOT NULL DEFAULT 0.000 COMMENT 'Số lượng hoặc khối lượng sản phẩm trong giỏ',
  PRIMARY KEY (cart_id, product_id),
  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id) REFERENCES product_master(product_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng cấu hình cart: thông tin BLE và camera cho từng cart
CREATE TABLE IF NOT EXISTS cart_config (
  cart_id                BIGINT          NOT NULL PRIMARY KEY,
  cart_mac_address       VARCHAR(17)     NULL COMMENT 'Địa chỉ MAC của cart (AA:BB:CC:DD:EE:FF)',
  cart_position          VARCHAR(36)     NULL COMMENT 'UUID BLE cho position',
  cart_state             VARCHAR(36)     NULL COMMENT 'UUID BLE cho state', 
  cart_voice_cmd         VARCHAR(36)     NULL COMMENT 'UUID BLE cho voice command',
  cart_firmware_update   VARCHAR(36)     NULL COMMENT 'UUID BLE cho firmware update',
  cam_stream_url         VARCHAR(512)    NULL COMMENT 'URL stream camera'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS map_beacon (
  map_id            BIGINT          NOT NULL,
  beacon_id         VARCHAR(10)     NOT NULL,
  beacon_mac_address VARCHAR(17)     NULL COMMENT 'Địa chỉ MAC của beacon (AA:BB:CC:DD:EE:FF)',
  beacon_x_coordinate DECIMAL(10,3) NULL COMMENT 'Tọa độ X của beacon',
  beacon_y_coordinate DECIMAL(10,3) NULL COMMENT 'Tọa độ Y của beacon', 
  beacon_D0         DECIMAL(6,1)    NULL COMMENT 'RSSI tại khoảng cách 1m (dBm)',
  beacon_n          DECIMAL(4,2)    NULL COMMENT 'Hệ số suy hao tín hiệu môi trường',
  PRIMARY KEY (map_id, beacon_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng map: thông tin mã hóa bản đồ 10x10
CREATE TABLE IF NOT EXISTS map (
  map_id        BIGINT        NOT NULL,
  x_coordinate  INT           NOT NULL,
  y_coordinate  INT           NOT NULL,
  area          VARCHAR(32)   DEFAULT NULL,
  PRIMARY KEY (map_id, x_coordinate, y_coordinate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;