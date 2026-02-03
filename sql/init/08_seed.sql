-- Seed data for Proyojon BNPL Platform

-- 1. Roles
INSERT INTO roles (name, description) VALUES
('Super Admin', 'Full access to all system features'),
('Support Agent', 'Can view user data and handle tickets');

-- 2. Admins
INSERT INTO admins (name, email, password_hash, role_id) VALUES
('System Admin', 'admin@proyojon.com', crypt('admin123', gen_salt('bf')), 1);

-- 3. Users (rich test data, passwords = 'password123')
INSERT INTO users (name, email, phone, nid_info, address, city, zip_code, credit_limit, password_hash, kyc_status, email_verified, phone_verified) VALUES
('Alice Karim', 'alice@example.com', '01711223344', '1234567890', '45 Gulshan Ave', 'Dhaka', '1212', 50000.00, crypt('password123', gen_salt('bf')), 'Verified', TRUE, TRUE),
('Bob Rahim', 'bob@example.com', '01811223344', '0987654321', '120 Agrabad', 'Chittagong', '4100', 30000.00, crypt('password123', gen_salt('bf')), 'Verified', TRUE, FALSE),
('Charlie Khan', 'charlie@example.com', '01911223344', '1122334455', '5 Zindabazar', 'Sylhet', '3100', 80000.00, crypt('password123', gen_salt('bf')), 'Pending', FALSE, FALSE);

-- 4. Product Categories
INSERT INTO product_categories (name, description) VALUES
('Electronics', 'Gadgets and appliances'),
('Fruits', 'Fresh fruits'),
('Dairy', 'Dairy products'),
('Bakery', 'Baked goods'),
('Vegetables', 'Fresh vegetables'),
('Furniture', 'Home and office furniture'),
('Clothing', 'Fashion and apparel'),
('Appliances', 'Home appliances'),
('Groceries', 'Daily essentials');

-- 5. Merchants
INSERT INTO merchants (name, type, contact_email, contact_phone, address, verified) VALUES
('TechWorld BD', 'Electronics', 'sales@techworld.com', '01700000001', 'IDB Bhaban, Dhaka', TRUE),
('Daily Mart', 'Groceries', 'contact@dailymart.com', '01700000002', 'Banani, Dhaka', TRUE),
('Lazz Pharma', 'Pharmacy', 'info@lazzpharma.com', '01700000003', 'Kalabagan, Dhaka', FALSE),
('Furniture Depot', 'General', 'info@furnituredepot.com', '01700000004', 'Mirpur, Dhaka', TRUE),
('Fashion Store', 'General', 'info@fashionstore.com', '01700000005', 'Dhanmondi, Dhaka', TRUE);

-- 6. Products (20 rich products matching the frontend mock data)
INSERT INTO products (merchant_id, category_id, name, description, brand, price, stock_quantity, image_url, bnpl_eligible) VALUES
-- Electronics (merchant 1)
(1, 1, 'Dell XPS 15 Laptop', '15.6" laptop with Intel i7, 16GB RAM, 512GB SSD. Perfect for work and gaming.', 'Dell', 1299.99, 25, 'https://images.unsplash.com/photo-1759668358660-0d06064f0f84?w=500&h=500&fit=crop', TRUE),
(1, 1, 'Samsung Galaxy S24', 'Latest smartphone with 256GB storage, 5G capable, stunning AMOLED display.', 'Samsung', 899.99, 40, 'https://images.unsplash.com/photo-1761645446921-27d641efa0b5?w=500&h=500&fit=crop', TRUE),
(1, 1, 'Sony WH-1000XM5 Headphones', 'Premium noise-canceling wireless headphones with 30-hour battery life.', 'Sony', 349.99, 60, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&h=500&fit=crop', TRUE),
(1, 1, 'LG 55" 4K Smart TV', '55-inch 4K OLED TV with HDR, webOS, and built-in streaming apps.', 'LG', 1499.99, 20, 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&h=500&fit=crop', TRUE),
-- Fruits (merchant 2)
(2, 2, 'Organic Bananas', 'Fresh organic bananas, rich in potassium and perfect for a healthy snack.', 'FreshFarm', 2.99, 150, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&h=500&fit=crop', TRUE),
(2, 2, 'Red Apples', 'Crisp and sweet red apples, perfect for snacking or baking.', 'OrchardFresh', 4.49, 180, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&h=500&fit=crop', TRUE),
-- Dairy (merchant 2)
(2, 3, 'Fresh Milk', 'Farm fresh whole milk, pasteurized and packed with nutrients.', 'DairyGold', 3.49, 80, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&h=500&fit=crop', TRUE),
(2, 3, 'Free Range Eggs', 'Farm fresh free-range eggs, packed with protein and vitamins.', 'HappyHens', 5.99, 120, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&h=500&fit=crop', TRUE),
(2, 3, 'Cheddar Cheese', 'Sharp aged cheddar cheese, perfect for snacking or cooking.', 'CheeseWorks', 6.99, 60, 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=500&h=500&fit=crop', TRUE),
-- Bakery (merchant 2)
(2, 4, 'Whole Wheat Bread', 'Freshly baked whole wheat bread, perfect for sandwiches and toast.', 'BreadCo', 4.99, 45, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=500&fit=crop', TRUE),
-- Vegetables (merchant 2)
(2, 5, 'Organic Tomatoes', 'Vine-ripened organic tomatoes, perfect for salads and cooking.', 'GreenValley', 3.99, 200, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&h=500&fit=crop', TRUE),
(2, 5, 'Fresh Spinach', 'Crisp and fresh organic spinach, packed with iron and vitamins.', 'OrganicGreens', 2.49, 90, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&h=500&fit=crop', TRUE),
-- Furniture (merchant 4)
(4, 6, 'Modern Gray Sofa', '3-seater comfortable sofa with washable covers. Perfect for living room.', 'HomeComfort', 799.99, 15, 'https://images.unsplash.com/photo-1656869929510-216b4976f854?w=500&h=500&fit=crop', TRUE),
(4, 6, 'Ergonomic Office Chair', 'Adjustable office chair with lumbar support and breathable mesh.', 'ErgoMaster', 299.99, 35, 'https://images.unsplash.com/photo-1600065428205-b3fb0bd02b3b?w=500&h=500&fit=crop', TRUE),
(4, 6, 'Queen Size Platform Bed', 'Modern platform bed frame with storage drawers. Easy assembly.', 'SleepWell', 599.99, 18, 'https://images.unsplash.com/photo-1640003145136-f998284e11de?w=500&h=500&fit=crop', TRUE),
-- Clothing (merchant 5)
(5, 7, 'Men''s Leather Jacket', 'Genuine leather jacket with classic style. Available in multiple sizes.', 'UrbanStyle', 249.99, 45, 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=500&h=500&fit=crop', TRUE),
(5, 7, 'Women''s Slim Fit Jeans', 'Comfortable stretch denim jeans in classic blue. High-waisted fit.', 'DenimCo', 79.99, 80, 'https://images.unsplash.com/photo-1609831190577-04538764f438?w=500&h=500&fit=crop', TRUE),
(5, 7, 'Running Sneakers Pro', 'High-performance running shoes with cushioned sole and arch support.', 'SportMax', 129.99, 100, 'https://images.unsplash.com/photo-1760302318631-a8d342cd4951?w=500&h=500&fit=crop', TRUE),
-- Appliances (merchant 1)
(1, 8, 'Smart Refrigerator', 'French door refrigerator with WiFi, touchscreen, and ice maker.', 'Samsung', 1899.99, 12, 'https://images.unsplash.com/photo-1758488438758-5e2eedf769ce?w=500&h=500&fit=crop', TRUE),
(1, 8, 'Front Load Washing Machine', 'Energy-efficient washing machine with 15 wash cycles and steam clean.', 'LG', 699.99, 22, 'https://images.unsplash.com/photo-1624381987697-3f93d65ddeea?w=500&h=500&fit=crop', TRUE);

-- 7. Credit Scores
INSERT INTO credit_scores (user_id, score) VALUES
(1, 750),
(2, 680),
(3, 590);

-- 8. Sample Order for Alice (3months plan)
INSERT INTO orders (user_id, merchant_id, total_amount, outstanding_balance, payment_plan, status, credit_score_used) VALUES
(1, 1, 899.99, 599.99, '3months', 'Confirmed', 750);

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 2, 1, 899.99);

INSERT INTO transactions (order_id, amount, payment_method, type, status, receipt) VALUES
(1, 299.99, 'Card', 'payment', 'Success', 'RCPT-001');

INSERT INTO installment_plans (transaction_id, order_id, total_installments, interest_rate, monthly_amount) VALUES
(1, 1, 3, 0.00, 299.99);

INSERT INTO installments (plan_id, installment_number, due_date, amount, status, paid_at) VALUES
(1, 1, CURRENT_DATE - INTERVAL '30 days', 299.99, 'Paid', NOW() - INTERVAL '30 days'),
(1, 2, CURRENT_DATE + INTERVAL '0 days', 299.99, 'Pending', NULL),
(1, 3, CURRENT_DATE + INTERVAL '30 days', 299.99, 'Pending', NULL);

-- 9. Notifications
INSERT INTO notifications (user_id, type, title, message) VALUES
(1, 'payment_success', 'Order Placed Successfully', 'Your order #1 for Samsung Galaxy S24 has been placed.'),
(1, 'payment_reminder', 'Payment Due Today', 'Your installment of $299.99 for order #1 is due today.');

-- 10. Update merchant sales
UPDATE merchants SET total_sales = 899.99, pending_settlement = 899.99 WHERE id = 1;
