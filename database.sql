-- =============================================
-- GOLDEN CRUST BAKERY — FULL DATABASE SETUP
-- =============================================

CREATE DATABASE IF NOT EXISTS golden_crust_bakery;
USE golden_crust_bakery;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin', 'user') DEFAULT 'customer',
    security_code VARCHAR(6) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    image_url VARCHAR(255),
    hover_image_url VARCHAR(255),
    featured_image_url VARCHAR(255),
    badge VARCHAR(50),
    in_stock BOOLEAN DEFAULT TRUE,
    archived TINYINT(1) DEFAULT 0,
    archived_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_archived (archived)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT,
    product_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- CONTACT MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- CART TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- SAMPLE PRODUCTS
-- Replace image paths with your actual files
-- image_url          → product card main image
-- hover_image_url    → product card hover image
-- featured_image_url → carousel/featured section
-- =============================================
INSERT INTO products (name, description, price, category, image_url, hover_image_url, featured_image_url, badge) VALUES
('Fruit Tart',       'Fresh seasonal fruits on pastry cream',                     260.00, 'pastry', 'img/product-1.jpg', 'img/product-1-hover.jpg', 'img/featured-1.jpg', 'Seasonal'),
('Chocolate Eclair', 'Choux pastry with chocolate glaze',                         220.00, 'pastry', 'img/product-2.jpg', 'img/product-2-hover.jpg', 'img/featured-2.jpg', 'Classic'),
('Apple Turnover',   'Caramelized apples in puff pastry',                         190.00, 'pastry', 'img/product-3.jpg', 'img/product-3-hover.jpg', 'img/featured-3.jpg', 'Traditional'),
('Butter Croissant', 'Flaky, buttery layers with golden crust',                   180.00, 'bread',  'img/product-4.jpg', 'img/product-4-hover.jpg', 'img/featured-4.jpg', 'Chef\'s Choice'),
('Pain au Chocolat', 'Dark chocolate in buttery pastry',                          200.00, 'pastry', 'img/product-5.jpg', 'img/product-5-hover.jpg', 'img/featured-5.jpg', 'Popular'),
('Almond Danish',    'Sweet almond cream and flaky pastry',                       220.00, 'pastry', 'img/product-6.jpg', 'img/product-6-hover.jpg', 'img/featured-6.jpg', 'New'),
('Sourdough Loaf',   'Naturally fermented with a crispy crust and tangy flavor',  320.00, 'bread',  'img/product-7.jpg', 'img/product-7-hover.jpg', 'img/featured-7.jpg', NULL),
('Baguette',         'Classic French bread with a golden crust and airy interior',160.00, 'bread',  'img/product-8.jpg', 'img/product-8-hover.jpg', 'img/featured-8.jpg', NULL),
('Cinnamon Roll',    'Soft swirled pastry with cream cheese frosting',            210.00, 'pastry', 'img/product-9.jpg', 'img/product-9-hover.jpg', 'img/featured-9.jpg', 'Bestseller');

-- =============================================
-- DEFAULT ADMIN ACCOUNT
-- =============================================
-- Username:      admin
-- Email:         admin@goldencrust.com
-- Password:      Admin@123
-- Security Code: GC2026
-- =============================================
INSERT INTO users (username, name, email, password, role, security_code, is_active) VALUES
('admin', 'System Administrator', 'admin@goldencrust.com', '$2y$12$uokUTDq5XJPSfuruMXAhUe8QiP4rAlauSDt9QWVdICA8yZ91OoXmu', 'admin', 'GC2026', 1)
ON DUPLICATE KEY UPDATE
    password      = '$2y$12$uokUTDq5XJPSfuruMXAhUe8QiP4rAlauSDt9QWVdICA8yZ91OoXmu',
    username      = 'admin',
    role          = 'admin',
    security_code = 'GC2026',
    is_active     = 1;

-- =============================================
-- VERIFY ADMIN ACCOUNT
-- =============================================
SELECT id, username, name, email, role, security_code, is_active
FROM users
WHERE role = 'admin';

-- =============================================
-- FOR EXISTING DATABASES — run these ALTERs
-- instead of the CREATE TABLE statements above
-- =============================================
/*
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username      VARCHAR(50) UNIQUE AFTER id,
  ADD COLUMN IF NOT EXISTS security_code VARCHAR(6)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_active     BOOLEAN     DEFAULT TRUE,
  MODIFY COLUMN role ENUM('customer', 'admin', 'user') DEFAULT 'customer';

ALTER TABLE users ADD INDEX IF NOT EXISTS idx_role (role);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS hover_image_url    VARCHAR(255) DEFAULT NULL AFTER image_url,
  ADD COLUMN IF NOT EXISTS featured_image_url VARCHAR(255) DEFAULT NULL AFTER hover_image_url,
  ADD COLUMN IF NOT EXISTS archived           TINYINT(1)  DEFAULT 0        AFTER in_stock,
  ADD COLUMN IF NOT EXISTS archived_at        TIMESTAMP   NULL DEFAULT NULL AFTER archived;

UPDATE products SET
    image_url          = CONCAT('img/product-',  id, '.jpg'),
    hover_image_url    = CONCAT('img/product-',  id, '-hover.jpg'),
    featured_image_url = CONCAT('img/featured-', id, '.jpg')
WHERE image_url NOT LIKE 'img/product-%';
*/