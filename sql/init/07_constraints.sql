CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category_id);

CREATE INDEX idx_merchants_type ON merchants(type);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);
CREATE INDEX idx_installments_plan_id ON installments(plan_id);

CREATE INDEX idx_orders_status ON orders(status) WHERE status = 'Pending';
CREATE INDEX idx_installments_overdue ON installments(status) WHERE status = 'Overdue';

ALTER TABLE users ADD CONSTRAINT chk_users_email_lower CHECK (email = LOWER(email));
ALTER TABLE admins ADD CONSTRAINT chk_admins_email_lower CHECK (email = LOWER(email));

-- Note: No future-date constraint on installments — historical paid installments are valid.
-- Overdue detection is handled by refresh_overdue_installments() function called on startup.

ALTER TABLE transactions ADD CONSTRAINT chk_transaction_amount_positive CHECK (amount > 0);
