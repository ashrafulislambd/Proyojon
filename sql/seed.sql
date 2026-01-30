-- Proyojon Database Seed Data
-- DBMS: PostgreSQL

-- 1. Roles
INSERT INTO roles (name, description) VALUES
('Super Admin', 'Full access to all system features'),
('Support Agent', 'Can view user data and handle tickets');

-- 2. Admins
INSERT INTO admins (name, email, password_hash, role_id) VALUES
('System Admin', 'admin@proyojon.com', crypt('admin123', gen_salt('bf')), 1);

-- 3. Users
INSERT INTO users (name, email, phone, nid_info, address, credit_limit, password_hash) VALUES
('Alice Karim', 'alice@example.com', '01711223344', '1234567890', 'Dhaka, Bangladesh', 50000.00, crypt('password123', gen_salt('bf'))),
('Bob Rahim', 'bob@example.com', '01811223344', '0987654321', 'Chittagong, Bangladesh', 30000.00, crypt('password123', gen_salt('bf'))),
('Charlie Khan', 'charlie@example.com', '01911223344', '1122334455', 'Sylhet, Bangladesh', 80000.00, crypt('password123', gen_salt('bf')));

-- 4. Product Categories
INSERT INTO product_categories (name, description) VALUES
('Electronics', 'Gadgets and appliances'),
('Groceries', 'Daily essentials and food'),
('Medicine', 'Pharmaceutical products');

-- 5. Merchants
INSERT INTO merchants (name, type, contact_email, address) VALUES
('TechWorld BD', 'Electronics', 'sales@techworld.com', 'IDB Bhaban, Dhaka'),
('Daily Mart', 'Groceries', 'contact@dailymart.com', 'Banani, Dhaka'),
('Lazz Pharma', 'Pharmacy', 'info@lazzpharma.com', 'Kalabagan, Dhaka');

-- 6. Products
INSERT INTO products (merchant_id, category_id, name, price, stock_quantity, image_url) VALUES
(1, 1, 'Smartphone X', 25000.00, 50, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800'),
(1, 1, 'Wireless Earbuds Pro', 4500.00, 100, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800'),
(1, 1, 'MacBook Air M2', 125000.00, 10, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800'),
(1, 1, 'Mechanical Keyboard', 5500.00, 30, '/C:/Users/zannatul/.gemini/antigravity/brain/b8820cee-0759-40d6-b3e7-78a5adc5154b/mechanical_keyboard_demo_1769692730520.png'),
(2, 2, 'Organic Honey (500g)', 850.00, 45, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800'),
(2, 2, 'Fresh Mangoes (1kg)', 220.00, 150, 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800'),
(2, 2, 'Premium Basmati Rice (5kg)', 1200.00, 60, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800'),
(2, 2, 'Pure Soybeans Oil (5L)', 850.00, 40, NULL),
(3, 3, 'Napa Extra (Pack of 10)', 25.00, 1000, NULL),
(3, 3, 'Ace Plus (Pack of 10)', 30.00, 1000, NULL),
(3, 3, 'First Aid Kit', 1500.00, 20, 'https://images.unsplash.com/photo-1603398938378-e54eab446ddd?auto=format&fit=crop&q=80&w=800'),
(3, 3, 'Digital Thermometer', 450.00, 15, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800');

-- 7. Orders
INSERT INTO orders (user_id, merchant_id, total_amount, status) VALUES
(1, 1, 28000.00, 'Delivered'), -- Alice bought Phone + Earbuds
(2, 2, 630.00, 'Pending');    -- Bob bought Rice + Oil

-- 8. Order Items
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 25000.00),
(1, 2, 1, 3000.00),
(2, 3, 1, 450.00),
(2, 4, 1, 180.00);

-- 9. Transactions
INSERT INTO transactions (order_id, amount, payment_method, status) VALUES
(1, 5000.00, 'Card', 'Success'); -- Down payment for order 1

-- 10. Installment Plans (for Order 1)
INSERT INTO installment_plans (transaction_id, total_installments, interest_rate) VALUES
(1, 3, 2.5); -- 3 months plan

-- 11. Installments (Remaining 23000 + interest split)
-- Simplified calc: 23000 * 1.025 / 3 ~= 7858.33
INSERT INTO installments (plan_id, due_date, amount, status) VALUES
(1, CURRENT_DATE + INTERVAL '30 days', 7858.33, 'Pending'),
(1, CURRENT_DATE + INTERVAL '60 days', 7858.33, 'Pending'),
(1, CURRENT_DATE + INTERVAL '90 days', 7858.34, 'Pending');

-- 12. Credit Scores
INSERT INTO credit_scores (user_id, score) VALUES
(1, 750),
(2, 680),
(3, 720);

-- 13. Notifications
INSERT INTO notifications (user_id, type, message) VALUES
(1, 'Order', 'Your order #1 has been delivered.');
