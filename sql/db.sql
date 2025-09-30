CREATE DATABASE IF NOT EXISTS svk_website
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE svk_website;

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- category
CREATE TABLE category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,       
  INDEX idx_category_name (name)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- collaborator
CREATE TABLE collaborator (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_collaborator_name (name)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- item_group
CREATE TABLE item_group (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- item
CREATE TABLE item (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  product_code VARCHAR(30) NULL UNIQUE,
  hs_code VARCHAR(30) NULL,
  category_id INT NOT NULL,
  group_id INT DEFAULT NULL,
  stock INT NOT NULL DEFAULT 0,
  stock_status ENUM(
    'available_immediately',
    'available_after_ordering',
    'available_3_to_5_days',
    'available_7_to_10_days',
    'currently_unavailable',
    'preorder',
    'ask_for_price'
  ) DEFAULT 'available_after_ordering',
  collaborator_id INT DEFAULT NULL,
  description_short VARCHAR(600) NOT NULL,
  description_full TEXT,
  specifications TEXT,
  price DECIMAL(10,2) NOT NULL COMMENT 'Price of the item, using DECIMAL for precision',
  weight INT NOT NULL DEFAULT 0,
  highlight BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_item_category
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_group
    FOREIGN KEY (group_id) REFERENCES item_group(id),
  CONSTRAINT fk_item_collaborator
    FOREIGN KEY (collaborator_id) REFERENCES collaborator(id),

  INDEX idx_item_name (name),
  INDEX idx_category_id (category_id),
  INDEX idx_stock (stock),
  INDEX idx_group_id (group_id),
  INDEX idx_hs_code (hs_code),
  INDEX idx_price (price),
  INDEX idx_weight (weight),
  INDEX idx_highlight (highlight),
  INDEX idx_stock_status (stock_status)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- item_images
CREATE TABLE item_images (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  item_id CHAR(36) NOT NULL,
  item_slug_name VARCHAR(100) NOT NULL,
  imageUrl VARCHAR(200) NOT NULL COMMENT 'URL of the image',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_item_images_item
    FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_images_item_slug
    FOREIGN KEY (item_slug_name) REFERENCES item(slug) ON DELETE CASCADE,

  INDEX idx_item_id (item_id),
  INDEX idx_item_slug_name (item_slug_name)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- item_variation
CREATE TABLE item_variation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  variation_price DECIMAL(10,2) NOT NULL,
  selection_type ENUM('optional', 'exclusive') NOT NULL DEFAULT 'optional',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_variation_item
    FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE CASCADE,

  INDEX idx_item_id (item_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- carts
CREATE TABLE carts (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  session_token VARCHAR(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL, -- opaque token for guest cart
  user_id VARCHAR(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,       -- set when logged in
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  expires_at DATETIME NULL,               -- hard expiry (e.g., now + 30 days)
  last_access_at DATETIME NULL,           -- rolling expiry (update on each use)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY ux_carts_session_token (session_token),
  INDEX idx_carts_user_id (user_id),
  INDEX idx_carts_expires_at (expires_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- cart_items
CREATE TABLE cart_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id    CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  qty        INT UNSIGNED NOT NULL CHECK (qty > 0),
  price      DECIMAL(10,2) NOT NULL CHECK (price >= 0),

  -- optional but handy: per-line subtotal for fast reads
  subtotal   DECIMAL(12,2) AS (qty * price) STORED,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,

  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id) REFERENCES item(id) ON DELETE RESTRICT,

  UNIQUE KEY ux_cart_items_cart_product (cart_id, product_id),
  INDEX idx_cart_items_cart_id (cart_id),
  INDEX idx_cart_items_product_id (product_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- orders
CREATE TABLE orders (
  order_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  order_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  total_amount DECIMAL(10, 2) DEFAULT 0.00,
  payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  order_type ENUM('receipt', 'invoice') NOT NULL,
  orderCode VARCHAR(255) UNIQUE,
  INDEX idx_order_type (order_type),
  INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- order_items
CREATE TABLE order_items (
  order_item_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id CHAR(36) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_product_code VARCHAR(30) NULL,
  item_variation_name VARCHAR(200) NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * price) STORED,

  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,

  INDEX idx_items_order_id (order_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- delivery_details
CREATE TABLE delivery_details (
  delivery_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id CHAR(36) NOT NULL,
  address_line VARCHAR(255),
  city VARCHAR(100),
  province VARCHAR(100),
  zip VARCHAR(20),
  country VARCHAR(100) NOT NULL,
  shipping_option ENUM('ELTA', 'FedEx', 'BoxNow') NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  box_now_locker_postal_code VARCHAR(20),
  box_now_locker_address_line1 VARCHAR(255),
  box_now_locker_id VARCHAR(50),

  CONSTRAINT fk_delivery_order
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,

  INDEX idx_delivery_order_id (order_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- receipt_details
CREATE TABLE receipt_details (
  receipt_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id CHAR(36) NOT NULL,

  CONSTRAINT fk_receipt_order
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,

  INDEX idx_receipts_order_id (order_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- invoice_details
CREATE TABLE invoice_details (
  invoice_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id CHAR(36) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  company_address VARCHAR(255) NOT NULL,
  company_city VARCHAR(100) NOT NULL,
  company_zip VARCHAR(100) NOT NULL,
  vat_number VARCHAR(50) NOT NULL,
  occupation VARCHAR(100) NOT NULL,
  tax_office VARCHAR(100) NOT NULL,

  CONSTRAINT fk_invoice_order
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,

  INDEX idx_invoice_order_id (order_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
