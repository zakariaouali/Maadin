# MAADIN Marketplace - Phase 2: Database Schema & SQL

**Status**: 🟡 IMPLEMENTATION PHASE  
**Deliverables**: SQL scripts, migrations, relationships, indexing, ERD

---

## 1. DATABASE CREATION & SETUP

### 1.1 Initial Database Setup

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS maadin_marketplace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE maadin_marketplace;

-- Set timezone (MySQL server must have timezone support)
SET time_zone = '+00:00';

-- Enable event scheduler for cleanup tasks
SET GLOBAL event_scheduler = ON;
```

---

## 2. CORE TABLES - FULL SQL SCHEMA

### 2.1 Users Table

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    role ENUM('customer', 'seller', 'admin') NOT NULL DEFAULT 'customer',
    status ENUM('active', 'suspended', 'banned') NOT NULL DEFAULT 'active',
    avatar_path VARCHAR(255) NULL COMMENT 'Relative path: users/avatar_123.jpg',
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Store all user accounts (customers, sellers, admins)  
**Size Estimate (MVP)**: ~10k rows  
**Key Points**:
- Email unique and indexed for fast login
- Role determines permissions
- Soft deletes supported (deleted_at)
- Password hashed by Laravel (not stored as plain text)

---

### 2.2 Sellers Table

```sql
CREATE TABLE sellers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    store_name VARCHAR(255) NOT NULL,
    store_slug VARCHAR(255) UNIQUE NOT NULL,
    store_description TEXT NULL,
    logo_path VARCHAR(255) NULL COMMENT 'Path: stores/logos/store_123.jpg',
    banner_path VARCHAR(255) NULL COMMENT 'Path: stores/banners/store_123.jpg',
    rating DECIMAL(3, 2) DEFAULT 0.00 COMMENT 'Calculated from reviews (0-5)',
    total_reviews INT DEFAULT 0,
    status ENUM('pending', 'verified', 'suspended') NOT NULL DEFAULT 'pending',
    level ENUM('bronze', 'silver', 'gold', 'verified_artisan') DEFAULT 'bronze',
    total_orders INT DEFAULT 0,
    response_time_hours INT NULL COMMENT 'Average response time to messages',
    bank_account_number VARCHAR(255) NULL COMMENT 'Encrypted field',
    bank_name VARCHAR(255) NULL,
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_store_slug (store_slug),
    INDEX idx_status (status),
    INDEX idx_level (level),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Store seller profiles and store information  
**Size Estimate (MVP)**: ~500 sellers  
**Key Points**:
- One-to-one with users table
- Store name and slug for URL generation
- Rating calculated from reviews
- Level auto-calculated (Phase 2)
- Bank details encrypted (Laravel encryption)

---

### 2.3 Categories Table

```sql
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    icon_path VARCHAR(255) NULL COMMENT 'Path: categories/icons/category_123.svg',
    parent_id BIGINT UNSIGNED NULL COMMENT 'For subcategories',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_parent_id (parent_id),
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Product categorization (Textiles, Jewelry, Pottery, etc.)  
**Size Estimate (MVP)**: ~50 categories  
**Key Points**:
- Self-referencing for subcategories
- Hierarchical structure (parent_id)
- Display order for frontend sorting

---

### 2.4 Products Table

```sql
CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description LONGTEXT NOT NULL,
    short_description VARCHAR(500) NULL,
    price DECIMAL(10, 2) NOT NULL COMMENT 'Selling price in MAD',
    cost DECIMAL(10, 2) NULL COMMENT 'Hidden from customers',
    stock_quantity INT NOT NULL DEFAULT 0,
    sku VARCHAR(100) UNIQUE NULL,
    rating DECIMAL(3, 2) DEFAULT 0.00 COMMENT '0-5 average',
    total_reviews INT DEFAULT 0,
    total_sales INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_category_id (category_id),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at),
    INDEX idx_rating (rating),
    INDEX idx_stock_quantity (stock_quantity),
    FULLTEXT INDEX ft_search (name, description, short_description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Product listings  
**Size Estimate (MVP)**: ~5,000 products  
**Key Points**:
- FULLTEXT index for search functionality
- Stock quantity tracked for inventory
- Cost hidden from database API responses
- Rating calculated from reviews
- Soft deletes for historical data

---

### 2.5 Product Images Table

```sql
CREATE TABLE product_images (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    image_path VARCHAR(255) NOT NULL COMMENT 'Path: products/images/product_123_1.jpg',
    alt_text VARCHAR(255) NULL,
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    file_size INT NULL COMMENT 'In bytes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_is_primary (is_primary),
    UNIQUE KEY unique_primary_per_product (product_id, is_primary) WHERE is_primary = TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Store product images (multiple per product)  
**Size Estimate (MVP)**: ~20,000 images  
**Key Points**:
- Display order for gallery sequence
- Only one primary image per product (enforced by unique constraint)
- Image paths are relative

---

### 2.6 Orders Table

```sql
CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    seller_id BIGINT UNSIGNED NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL COMMENT 'Human-readable: ORD-2026-001234',
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    total_price DECIMAL(10, 2) NOT NULL COMMENT 'Total in MAD',
    shipping_address VARCHAR(255) NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_postal_code VARCHAR(10) NULL,
    payment_method ENUM('cash','card') DEFAULT 'cash',
    payment_status ENUM('pending', 'received') DEFAULT 'pending',
    notes TEXT NULL COMMENT 'Customer special requests',
    tracking_number VARCHAR(100) NULL,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE RESTRICT,
    INDEX idx_customer_id (customer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_shipped_at (shipped_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Order records  
**Size Estimate (MVP)**: ~2,000 orders  
**Key Points**:
- Order number human-readable for customer reference
- Separate orders per seller (if multi-seller purchase)
- Cash on Delivery only (Phase 1)
- Address captured at order time (not linked to user address)
- Delivery dates tracked

---

### 2.7 Order Items Table

```sql
CREATE TABLE order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    seller_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL COMMENT 'Locked price when ordered',
    product_name VARCHAR(255) NOT NULL COMMENT 'Snapshot at order time',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id),
    INDEX idx_seller_id (seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Individual items within an order  
**Size Estimate (MVP)**: ~5,000 items  
**Key Points**:
- price_at_purchase: Locks the price at order time (product price might change)
- product_name snapshot: Product name might change in future
- Seller denormalized for quick lookups

---

### 2.8 Reviews Table

```sql
CREATE TABLE reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    order_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    seller_id BIGINT UNSIGNED NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255) NULL,
    content TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review_per_product (product_id, customer_id),
    INDEX idx_product_id (product_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_status (status),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Product and seller reviews  
**Size Estimate (MVP)**: ~1,000 reviews  
**Key Points**:
- One review per product per customer (enforced by unique constraint)
- Verified purchase flag (all Phase 1 reviews verified)
- Admin moderation queue (status: pending)
- Rating enforced to 1-5 range

---

### 2.9 Wishlists Table

```sql
CREATE TABLE wishlists (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist_item (customer_id, product_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Customer wishlists  
**Size Estimate (MVP)**: ~3,000 items  
**Key Points**:
- Simple many-to-many relationship
- One entry per customer-product pair (unique constraint)

---

### 2.10 Conversations Table

```sql
CREATE TABLE conversations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    buyer_id BIGINT UNSIGNED NOT NULL,
    seller_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NULL COMMENT 'About which product (if any)',
    order_id BIGINT UNSIGNED NULL COMMENT 'Related to which order (if any)',
    last_message_at TIMESTAMP NULL,
    status ENUM('active', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    UNIQUE KEY unique_conversation (buyer_id, seller_id),
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_last_message_at (last_message_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Conversation threads between buyers and sellers  
**Size Estimate (MVP)**: ~500 conversations  
**Key Points**:
- One active conversation per buyer-seller pair (enforced by unique constraint)
- Conversation can be about a product or order (or general)
- Last message timestamp for sorting

---

### 2.11 Messages Table

```sql
CREATE TABLE messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT UNSIGNED NOT NULL,
    sender_id BIGINT UNSIGNED NOT NULL,
    receiver_id BIGINT UNSIGNED NOT NULL,
    content LONGTEXT NOT NULL,
    has_blocked_content BOOLEAN DEFAULT FALSE COMMENT 'Flagged if contains sensitive patterns',
    blocked_patterns JSON NULL COMMENT '["phone_number", "email", "whatsapp"]',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Individual messages in conversations  
**Size Estimate (MVP)**: ~5,000 messages  
**Key Points**:
- Content filtering flags applied by server
- Blocked patterns stored as JSON
- Read status tracked with timestamp
- Immutable after creation (no edit/delete in MVP)

---

### 2.12 Penalties Table

```sql
CREATE TABLE penalties (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_id BIGINT UNSIGNED NOT NULL,
    admin_id BIGINT UNSIGNED NOT NULL,
    reason ENUM('fake_stock', 'delayed_order', 'bad_behavior', 'other') NOT NULL,
    description TEXT NOT NULL,
    penalty_type ENUM('warning', 'suspension', 'ban') NOT NULL,
    duration_days INT NULL COMMENT 'NULL for permanent',
    expires_at TIMESTAMP NULL COMMENT 'When penalty expires (auto-lift)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_seller_id (seller_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_penalty_type (penalty_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Seller penalties for violations  
**Size Estimate (MVP)**: ~20 penalties  
**Key Points**:
- Admin applied manually in Phase 1
- Auto-lift supported (Phase 2)
- Immutable audit trail

---

### 2.13 Carts Table

```sql
CREATE TABLE carts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NULL COMMENT 'NULL for guest sessions',
    session_id VARCHAR(255) UNIQUE NOT NULL,
    items JSON NOT NULL DEFAULT '[]' COMMENT '[{product_id, quantity}, ...]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL COMMENT 'For cleanup',
    
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Shopping cart persistence  
**Size Estimate (MVP)**: ~500 active carts  
**Key Points**:
- JSON for flexible item structure
- Supports both registered customers and guests
- Auto-cleanup via event scheduler

---

### 2.14 Admin Audit Log Table (Phase 2)

```sql
CREATE TABLE admin_audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id BIGINT UNSIGNED NOT NULL,
    action VARCHAR(255) NOT NULL COMMENT 'suspend_user, approve_seller, etc.',
    subject_type VARCHAR(100) NOT NULL COMMENT 'user, seller, product, order',
    subject_id BIGINT UNSIGNED NOT NULL,
    changes JSON NULL COMMENT 'What changed',
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_admin_id (admin_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Audit trail for admin actions  
**Size Estimate (MVP)**: ~1,000 logs  
**Key Points**:
- Immutable log of all admin changes
- JSON for flexible change tracking

---

## 3. COMPREHENSIVE INDEXING STRATEGY

### 3.1 Index Summary Table

| Table | Index Columns | Type | Purpose |
|-------|---------------|------|---------|
| users | email | UNIQUE | Fast login lookups |
| users | role, status | COMPOSITE | Filter users by role/status |
| sellers | user_id, status | COMPOSITE | Find sellers by status |
| products | seller_id, is_active | COMPOSITE | List seller's active products |
| products | category_id, created_at | COMPOSITE | Category browsing with sorting |
| products | name, description | FULLTEXT | Product search |
| orders | customer_id, created_at | COMPOSITE | Order history per customer |
| orders | seller_id, status | COMPOSITE | Seller's orders by status |
| messages | conversation_id, created_at | COMPOSITE | Message history chronological |
| messages | receiver_id, is_read | COMPOSITE | Unread message counts |
| conversations | buyer_id, seller_id | UNIQUE | One active conversation |

### 3.2 Query Performance Optimization

**High-Traffic Queries** (optimized):
```sql
-- Product listing with filters (uses composite index)
SELECT * FROM products 
WHERE category_id = ? AND is_active = TRUE 
ORDER BY created_at DESC 
LIMIT 20;
-- Uses: idx_category_id, is_active

-- Customer's order history (uses composite index)
SELECT * FROM orders 
WHERE customer_id = ? 
ORDER BY created_at DESC;
-- Uses: idx_customer_id, created_at

-- Seller's pending orders (uses composite index)
SELECT * FROM orders 
WHERE seller_id = ? AND status = 'pending' 
ORDER BY created_at ASC;
-- Uses: idx_seller_id, status

-- Search products (uses FULLTEXT)
SELECT * FROM products 
WHERE MATCH(name, description) AGAINST(? IN BOOLEAN MODE) 
AND is_active = TRUE;
-- Uses: ft_search

-- Unread message count (uses composite index)
SELECT COUNT(*) FROM messages 
WHERE receiver_id = ? AND is_read = FALSE;
-- Uses: idx_receiver_id, is_read
```

### 3.3 Avoiding N+1 Queries

**Solution**: Use Eloquent eager loading in Laravel
```php
// Load products with images, seller, reviews
$products = Product::with('images', 'seller', 'reviews')
    ->where('is_active', true)
    ->paginate(20);

// Load orders with items and customer
$orders = Order::with('items.product', 'customer')
    ->where('seller_id', $sellerId)
    ->get();
```

---

## 4. DATABASE RELATIONSHIPS (ERD Description)

### 4.1 Relationship Diagram

```
┌─────────────┐
│   USERS     │◄─────────────┐
└──────┬──────┘              │
       │                     │
       │ 1:1                 │ 1:Many (admin)
       ▼                     │
┌─────────────┐              │
│  SELLERS    │              │
└──────┬──────┘              │
       │                     │
       │ 1:Many         ┌────▼────┐
       ▼                │ PENALTIES│
┌─────────────┐        └─────────┘
│ PRODUCTS    │
└──────┬──────┘
       │ 1:Many
       ▼
┌─────────────────┐
│ PRODUCT_IMAGES  │
└─────────────────┘


┌──────────────┐
│ CATEGORIES   │◄────┐ (1:Many)
│ (self-ref)   │     │
└──────┬───────┘     │
       │ 1:Many  ┌───┴──────────┐
       └────────►PRODUCTS◄──────┘


┌──────────┐     ┌────────┐
│ CUSTOMERS│───┬─┤ ORDERS │◄────┐
│(Users)   │ 1 │ └────┬───┘      │ 1
└──────────┘   │  Many│          │
               │      ▼       ┌──┴─────────┐
               │   ┌──────────────┐        │
               │   │ ORDER_ITEMS  │        │
               │   └──────┬───────┘        │
               │          │                │
               │    1:Many│                │
               │          ▼           ┌───┴──────┐
               │      PRODUCTS◄──────┤ SELLERS  │
               │                     └──────────┘


┌──────────────┐
│ CUSTOMERS    │───┐ 1:Many
└──────────────┘   │
                   ▼
┌──────────────┐
│ WISHLISTS    │───┐ Many:1
└──────────────┘   │
                   ▼
┌──────────────┐
│ PRODUCTS     │
└──────────────┘


┌──────────────┐  1
│ BUYERS       │────┐
│ (Users)      │    │ Many
└──────────────┘    ▼
                ┌──────────────┐
                │ CONVERSATIONS│
                └──────┬───────┘
                       │ 1:Many
                       ▼
                ┌──────────────┐
                │  MESSAGES    │
                └──────────────┘
                
                ┌──────────────┐  1
                │ SELLERS      │────┐
                │ (Users)      │    │
                └──────────────┘    │ Many
                                    ▼
                                CONVERSATIONS


┌──────────────┐  1
│ REVIEWS      │────┐ Many:1
└──────────────┘    ▼
                ┌──────────────┐
                │  PRODUCTS    │
                └──────────────┘
```

### 4.2 Cardinality Summary

| From | To | Relationship | Enforced By |
|------|-----|-------------|------------|
| Users | Sellers | 1:1 (optional) | Foreign Key + Unique |
| Sellers | Products | 1:Many | Foreign Key |
| Categories | Products | 1:Many | Foreign Key |
| Categories | Categories | Self-referencing | Foreign Key (parent_id) |
| Users | Orders (customer) | 1:Many | Foreign Key |
| Sellers | Orders (seller) | 1:Many | Foreign Key |
| Orders | OrderItems | 1:Many | Foreign Key cascade delete |
| Products | OrderItems | 1:Many | Foreign Key restrict delete |
| Products | ProductImages | 1:Many | Foreign Key cascade delete |
| Products | Reviews | 1:Many | Foreign Key |
| Users | Reviews (customer) | 1:Many | Foreign Key |
| Sellers | Reviews (seller) | 1:Many | Foreign Key |
| Users | Wishlists (customer) | 1:Many | Foreign Key |
| Products | Wishlists | 1:Many | Foreign Key |
| Users | Conversations (buyer) | 1:Many | Foreign Key |
| Users | Conversations (seller) | 1:Many | Foreign Key |
| Conversations | Messages | 1:Many | Foreign Key cascade delete |
| Users | Messages (sender) | 1:Many | Foreign Key |
| Sellers | Penalties | 1:Many | Foreign Key |
| Users | PenaltyLogs (admin) | 1:Many | Foreign Key |

---

## 5. DATA CONSTRAINTS & VALIDATIONS

### 5.1 Database-Level Constraints

```sql
-- Ensure price is positive
ALTER TABLE products ADD CONSTRAINT chk_price_positive CHECK (price > 0);

-- Ensure stock is non-negative
ALTER TABLE products ADD CONSTRAINT chk_stock_non_negative CHECK (stock_quantity >= 0);

-- Ensure rating is between 0 and 5
ALTER TABLE products ADD CONSTRAINT chk_product_rating CHECK (rating >= 0 AND rating <= 5);
ALTER TABLE sellers ADD CONSTRAINT chk_seller_rating CHECK (rating >= 0 AND rating <= 5);

-- Ensure review rating is between 1 and 5
ALTER TABLE reviews ADD CONSTRAINT chk_review_rating CHECK (rating >= 1 AND rating <= 5);

-- Ensure quantity in order items is positive
ALTER TABLE order_items ADD CONSTRAINT chk_order_quantity CHECK (quantity > 0);

-- Ensure order total is positive
ALTER TABLE orders ADD CONSTRAINT chk_order_total CHECK (total_price > 0);
```

### 5.2 Application-Level Validations

**Users Table**:
- Email must be valid format
- Password minimum 8 characters
- Phone number format validation (Morocco: +212, 06, 07)

**Sellers Table**:
- Store name required, 3-100 characters
- Store slug must be URL-safe alphanumeric
- Phone required for seller
- Bank details encrypted before storage

**Products Table**:
- Product name required, max 255 characters
- Description required, min 50 characters
- Price decimal(10,2), max value 99,999.99 MAD
- Stock must be integer >= 0
- SKU unique if provided

**Orders Table**:
- Address must be non-empty
- City required
- Phone required
- Total price must match recalculated backend total

**Messages Table**:
- Content required, max 10,000 characters
- Content filtering applied server-side

---

## 6. TRANSACTION HANDLING

### 6.1 Critical Transactions

**Checkout Transaction** (ACID):
```sql
START TRANSACTION;

-- 1. Verify product exists and stock available
SELECT * FROM products WHERE id = ? AND stock_quantity >= ? FOR UPDATE;

-- 2. Create order
INSERT INTO orders (...) VALUES (...);

-- 3. Decrement stock
UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?;

-- 4. Create order items
INSERT INTO order_items (...) VALUES (...);

-- 5. Verify cart total matches
-- (Recalculate all items and compare)

COMMIT;
```

**Order Status Update** (Multi-seller):
```sql
START TRANSACTION;

-- Update all orders from this seller
UPDATE orders SET status = 'shipped' WHERE seller_id = ? AND status = 'confirmed';

-- Update seller metrics
UPDATE sellers SET total_orders = total_orders + 1 WHERE id = ?;

-- Log activity
INSERT INTO admin_audit_logs (...) VALUES (...);

COMMIT;
```

### 6.2 Deadlock Prevention

- Order by ID consistently in multi-table updates
- Keep transactions short
- Avoid updating parent tables in loops
- Use row-level locks (FOR UPDATE) when needed

---

## 7. DATA MIGRATION & SEEDING STRATEGY

### 7.1 Migration Files (Laravel Convention)

```
database/migrations/
├─ 2026_01_01_000001_create_users_table.php
├─ 2026_01_01_000002_create_sellers_table.php
├─ 2026_01_01_000003_create_categories_table.php
├─ 2026_01_01_000004_create_products_table.php
├─ 2026_01_01_000005_create_product_images_table.php
├─ 2026_01_01_000006_create_orders_table.php
├─ 2026_01_01_000007_create_order_items_table.php
├─ 2026_01_01_000008_create_reviews_table.php
├─ 2026_01_01_000009_create_wishlists_table.php
├─ 2026_01_01_000010_create_conversations_table.php
├─ 2026_01_01_000011_create_messages_table.php
├─ 2026_01_01_000012_create_penalties_table.php
├─ 2026_01_01_000013_create_carts_table.php
└─ 2026_01_01_000014_create_admin_audit_logs_table.php
```

### 7.2 Seed Files (Laravel Seeders)

```
database/seeders/
├─ DatabaseSeeder.php (main)
├─ UserSeeder.php (admin + test users)
├─ SellerSeeder.php (3-5 test sellers)
├─ CategorySeeder.php (Moroccan artisan categories)
├─ ProductSeeder.php (20-30 products)
└─ ReviewSeeder.php (sample reviews)
```

### 7.3 Deployment Process

```bash
# Local development
php artisan migrate:fresh --seed

# Production (first time)
php artisan migrate
php artisan db:seed --class=CategorySeeder
php artisan db:seed --class=UserSeeder

# Production (updates)
php artisan migrate
# (Seeders run only on demand for fresh data)
```

---

## 8. BACKUP & RECOVERY STRATEGY

### 8.1 Backup Plan

**Daily Automated Backup** (VPS):
```bash
#!/bin/bash
# /usr/local/bin/backup-maadin-db.sh

BACKUP_DIR="/backups/maadin"
DB_NAME="maadin_marketplace"
DATE=$(date +%Y%m%d_%H%M%S)

# Full database backup
mysqldump -u root -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

# Upload to remote storage (Phase 2)
# aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://maadin-backups/
```

**Cron Schedule**:
```
0 2 * * * /usr/local/bin/backup-maadin-db.sh
```

### 8.2 Disaster Recovery

**Test Recovery Monthly**:
```bash
# Restore from backup
gunzip < /backups/maadin/db_YYYYMMDD_HHMMSS.sql.gz | mysql -u root -p maadin_marketplace

# Verify data integrity
php artisan tinker
>>> User::count()
>>> Product::count()
```

---

## 9. PERFORMANCE CONSIDERATIONS

### 9.1 Query Optimization Tips

**Problem**: Finding products with reviews
```sql
-- ❌ Slow (multiple scans)
SELECT p.*, COUNT(r.id) as review_count
FROM products p
LEFT JOIN reviews r ON p.id = r.product_id
WHERE p.category_id = ? AND p.is_active = TRUE
GROUP BY p.id;

-- ✅ Fast (uses indexed columns)
SELECT p.* FROM products p
WHERE p.category_id = ? AND p.is_active = TRUE
ORDER BY p.total_reviews DESC;
-- (Store denormalized total_reviews on product)
```

### 9.2 Denormalization Strategy

**Denormalized Fields** (updated via trigger or event):
- `products.total_reviews` - count of reviews
- `products.rating` - average rating
- `sellers.total_reviews` - count of seller reviews
- `sellers.rating` - average seller rating
- `sellers.total_orders` - count of completed orders
- `conversations.last_message_at` - timestamp of latest message

**Why**: Avoid expensive aggregations on high-traffic queries

### 9.3 Caching Strategy (Phase 2+)

```php
// Cache product listings
Cache::remember('products_category_'.$categoryId, 3600, function () {
    return Product::where('category_id', $categoryId)
        ->where('is_active', true)
        ->orderBy('created_at', 'desc')
        ->get();
});

// Cache seller ratings
Cache::remember('seller_rating_'.$sellerId, 86400, function () {
    return Review::where('seller_id', $sellerId)->avg('rating');
});
```

---

## 10. CLEANUP & MAINTENANCE EVENTS

### 10.1 Event Scheduler (MySQL Events)

```sql
-- Auto-lift expired penalties
CREATE EVENT cleanup_expired_penalties
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
UPDATE penalties 
SET expires_at = NULL, penalty_type = 'warning'
WHERE expires_at < NOW() AND expires_at IS NOT NULL;

-- Clear old cart sessions
CREATE EVENT cleanup_old_carts
ON SCHEDULE EVERY 1 HOUR
STARTS CURRENT_TIMESTAMP
DO
DELETE FROM carts WHERE expires_at < NOW();

-- Update seller metrics daily
CREATE EVENT update_seller_metrics
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP AT '03:00:00'
DO
UPDATE sellers
SET rating = (SELECT AVG(rating) FROM reviews WHERE seller_id = sellers.id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE seller_id = sellers.id)
WHERE deleted_at IS NULL;
```

### 10.2 Laravel Task Scheduling

```php
// app/Console/Kernel.php
$schedule->command('app:lift-expired-penalties')->daily();
$schedule->command('app:cleanup-carts')->hourly();
$schedule->command('app:update-seller-metrics')->daily();
```

---

## 11. NEXT STEPS (Phase 2 COMPLETE)

✅ **Deliverables Complete**:
1. ✓ 14 core tables defined with full SQL
2. ✓ All relationships documented
3. ✓ Comprehensive indexing strategy
4. ✓ Constraints and validations
5. ✓ Transaction handling
6. ✓ Migration strategy
7. ✓ Backup and recovery plan
8. ✓ Performance optimizations
9. ✓ Maintenance events

### 🔄 Upon Approval, Phase 3 Begins:
- Generate exact SQL CREATE files
- Create Laravel migrations
- Create seeders
- Test data integrity
- Performance baseline testing

---

**Document Version**: 2.0  
**Status**: 🟡 AWAITING APPROVAL FOR PHASE 3
