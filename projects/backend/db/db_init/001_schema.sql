CREATE DATABASE IF NOT EXISTS iotc25_advanced_support_squad
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE iotc25_advanced_support_squad;

-- Bảng 0: thông tin sản phẩm
CREATE TABLE IF NOT EXISTS product_master (
  product_id            INT AUTO_INCREMENT PRIMARY KEY,
  product_name          VARCHAR(255)        NOT NULL,
  product_type          ENUM('food','drink','household','stationery') NOT NULL,
  area                  VARCHAR(64)         NULL,
  price                 DECIMAL(10,2)       NOT NULL DEFAULT 0.00,
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
  quantity    INT UNSIGNED    NOT NULL DEFAULT 0,
  PRIMARY KEY (cart_id, product_id),
  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id) REFERENCES product_master(product_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;