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
