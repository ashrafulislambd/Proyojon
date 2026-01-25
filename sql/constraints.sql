-- Proyojon Database Constraints & Indexes
-- DBMS: PostgreSQL

-- ==========================================
-- 1. Indexing Strategy
-- ==========================================

-- A. Search Optimization Indexes
-- Users often search for products by name or category
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category_id);

-- Merchants are searched by type (e.g., 'Pharmacy')
CREATE INDEX idx_merchants_type ON merchants(type);

-- B. Performance Indexes for Joins and FKs
-- Frequently used in WHERE clauses and JOINs
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);
CREATE INDEX idx_installments_plan_id ON installments(plan_id);

-- C. Filtering Indexes
-- Quickly find pending orders or overdue installments
CREATE INDEX idx_orders_status ON orders(status) WHERE status = 'Pending';
CREATE INDEX idx_installments_overdue ON installments(status) WHERE status = 'Overdue';

-- ==========================================
-- 2. Additional Constraints
-- ==========================================

-- Ensure email addresses are lowercase for consistency
ALTER TABLE users ADD CONSTRAINT chk_users_email_lower CHECK (email = LOWER(email));
ALTER TABLE admins ADD CONSTRAINT chk_admins_email_lower CHECK (email = LOWER(email));

-- Ensure dates are logical
ALTER TABLE installments ADD CONSTRAINT chk_installments_due_date_future CHECK (due_date >= CURRENT_DATE);

-- Ensure transaction amount is positive
ALTER TABLE transactions ADD CONSTRAINT chk_transaction_amount_positive CHECK (amount > 0);
