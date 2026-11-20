-- StockPilot MySQL schema: for learning and future backend integration.
-- The static website does NOT connect to MySQL; live data is stored in browser IndexedDB.
CREATE DATABASE IF NOT EXISTS stockpilot; USE stockpilot;

CREATE TABLE categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255)
);
CREATE TABLE suppliers (
  supplier_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  contact_person VARCHAR(100), email VARCHAR(120), phone VARCHAR(30)
);
CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  category_id INT NOT NULL,
  supplier_id INT NULL,
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_stock INT NOT NULL DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES categories(category_id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL
);
CREATE TABLE stock_transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  type ENUM('IN','OUT') NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Sample data
INSERT INTO categories (name, description) VALUES ('Electronics','Devices and accessories'),('Stationery','Office supplies');
INSERT INTO suppliers (name, contact_person, email, phone) VALUES ('TechSource Ltd','Asha Rao','sales@techsource.example','+91 90000 11111');
INSERT INTO products (sku, name, category_id, supplier_id, unit_price, quantity, min_stock) VALUES
 ('SP-0001','Wireless Mouse',1,1,799.00,40,10),('SP-0002','Notebook A5',2,1,60.00,120,30);
-- unit_price is stored in INR (₹)
INSERT INTO stock_transactions (product_id, type, quantity, note) VALUES (1,'IN',50,'Opening purchase'),(1,'OUT',10,'Order #1042');

-- Example queries
SELECT p.sku, p.name, c.name AS category, p.quantity FROM products p JOIN categories c USING (category_id) WHERE p.quantity <= p.min_stock;  -- low stock
SELECT SUM(quantity * unit_price) AS inventory_value FROM products;
SELECT * FROM stock_transactions WHERE created_at BETWEEN '2026-01-01' AND '2026-12-31' ORDER BY created_at DESC;
UPDATE products SET quantity = quantity - 5 WHERE product_id = 1 AND quantity >= 5;
DELETE FROM stock_transactions WHERE transaction_id = 2;

-- Purchase orders (used by the Purchase Orders page)
CREATE TABLE purchase_orders (
  po_id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NULL,
  status ENUM('Draft','Ordered','Received') NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL
);
CREATE TABLE po_items (
  po_id INT NOT NULL, product_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0), unit_price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (po_id, product_id),
  FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);
CREATE VIEW v_low_stock AS
  SELECT p.product_id, p.name, p.quantity, p.min_stock, GREATEST(p.min_stock*2 - p.quantity, 1) AS suggested_qty
  FROM products p WHERE p.quantity <= p.min_stock;
-- stock movement per day (dashboard chart)
SELECT DATE(created_at) AS day, type, SUM(quantity) AS units FROM stock_transactions
  WHERE created_at >= NOW() - INTERVAL 7 DAY GROUP BY day, type ORDER BY day;
