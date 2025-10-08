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
  item_id CHAR(36) NOT NULL,
  qty        INT UNSIGNED NOT NULL CHECK (qty > 0),
  price      DECIMAL(10,2) NOT NULL CHECK (price >= 0),

  -- optional but handy: per-line subtotal for fast reads
  subtotal   DECIMAL(12,2) AS (qty * price) STORED,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_item FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE RESTRICT,

  UNIQUE KEY ux_cart_items_cart_item (cart_id, item_id),
  INDEX idx_cart_items_cart_id (cart_id),
  INDEX idx_cart_items_item_id (item_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- handles only item variations that get added to cart
CREATE TABLE cart_item_variations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_item_id BIGINT UNSIGNED NOT NULL,
  variation_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_civ_item FOREIGN KEY (cart_item_id) REFERENCES cart_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_civ_variation FOREIGN KEY (variation_id) REFERENCES item_variation(id) ON DELETE RESTRICT,
  UNIQUE KEY ux_cartitem_variation (cart_item_id, variation_id)
);
