-- SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- discounts: master records
CREATE TABLE discount (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  discount_type ENUM('fixed','percent') NOT NULL,  -- fixed = subtract fixed amount; percent = subtract % of price
  value DECIMAL(10,2) NOT NULL,                 -- fixed: euros; percent: 0..100
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,

  -- stacking option for discounts 
  stackable BOOLEAN NOT NULL DEFAULT FALSE,

  coupon_code VARCHAR(64) UNIQUE NULL,
  max_global_uses INT NULL,
  max_user_uses INT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_active_window (active, starts_at, ends_at),
  INDEX idx_coupon (coupon_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Composite table (Discount <--> item)
CREATE TABLE discount_item (
  discount_id INT NOT NULL,
  item_id CHAR(36) NOT NULL,
  PRIMARY KEY (discount_id, item_id),
  CONSTRAINT fk_dis_item_discount FOREIGN KEY (discount_id) REFERENCES discount(id) ON DELETE CASCADE,
  CONSTRAINT fk_dis_item_item     FOREIGN KEY (item_id)     REFERENCES item(id)     ON DELETE CASCADE,
  INDEX idx_item (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Composite table (Discount <--> category)
CREATE TABLE discount_category (
  discount_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (discount_id, category_id),
  CONSTRAINT fk_dis_cat_discount FOREIGN KEY (discount_id) REFERENCES discount(id) ON DELETE CASCADE,
  CONSTRAINT fk_dis_cat_category FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE,
  INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
