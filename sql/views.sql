-- =============================================
-- VIEWS
-- =============================================

-- User credit health view (used by profile functions)
CREATE OR REPLACE VIEW vw_user_credit_health AS
SELECT
    u.id,
    u.name,
    u.email,
    u.phone,
    u.address,
    u.city,
    u.zip_code,
    u.credit_limit,
    u.kyc_status,
    u.email_verified,
    u.phone_verified,
    COALESCE((SELECT score FROM credit_scores WHERE user_id = u.id ORDER BY calculated_at DESC LIMIT 1), 500) AS credit_score,
    u.credit_limit - COALESCE((SELECT SUM(outstanding_balance) FROM orders WHERE user_id = u.id AND status NOT IN ('Delivered', 'Cancelled')), 0) AS remaining_credit,
    COALESCE((SELECT SUM(outstanding_balance) FROM orders WHERE user_id = u.id AND status NOT IN ('Delivered', 'Cancelled')), 0) AS total_due
FROM users u;


-- Merchant performance view
CREATE OR REPLACE VIEW vw_merchant_performance AS
SELECT
    m.id,
    m.name AS merchant_name,
    m.contact_email,
    m.verified,
    COUNT(DISTINCT o.id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_revenue,
    m.pending_settlement
FROM merchants m
LEFT JOIN orders o ON m.id = o.merchant_id AND o.status != 'Cancelled'
GROUP BY m.id, m.name, m.contact_email, m.verified, m.pending_settlement;


-- Daily revenue view
CREATE OR REPLACE VIEW vw_daily_revenue AS
SELECT
    DATE_TRUNC('day', o.created_at) AS day,
    COUNT(*) AS order_count,
    SUM(o.total_amount) AS revenue
FROM orders o
WHERE o.status != 'Cancelled'
GROUP BY DATE_TRUNC('day', o.created_at)
ORDER BY day DESC;


-- Overdue installments view
CREATE OR REPLACE VIEW vw_overdue_installments AS
SELECT
    i.id,
    i.due_date,
    i.amount,
    u.name AS user_name,
    u.email AS user_email,
    o.id AS order_id
FROM installments i
JOIN installment_plans ip ON i.plan_id = ip.id
FROM installments i
JOIN installment_plans ip ON i.plan_id = ip.id
JOIN orders o ON ip.order_id = o.id
JOIN users u ON o.user_id = u.id
WHERE i.status = 'Pending' AND i.due_date < CURRENT_DATE;


-- Top selling products view
CREATE OR REPLACE VIEW vw_top_selling_products AS
SELECT
    p.id,
    p.name,
    p.brand,
    c.name AS category_name,
    m.name AS merchant_name,
    SUM(oi.quantity) AS total_sold,
    SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
JOIN product_categories c ON p.category_id = c.id
JOIN merchants m ON p.merchant_id = m.id
WHERE o.status != 'Cancelled'
GROUP BY p.id, p.name, p.brand, c.name, m.name
ORDER BY total_sold DESC;


-- Upcoming installments view (next 7 days)
CREATE OR REPLACE VIEW vw_upcoming_installments AS
SELECT
    i.id AS installment_id,
    i.due_date,
    i.amount,
    u.name AS user_name,
    u.phone AS user_phone,
    o.id AS order_id
FROM installments i
JOIN installment_plans ip ON i.plan_id = ip.id
JOIN orders o ON ip.order_id = o.id
JOIN users u ON o.user_id = u.id
WHERE i.status = 'Pending'
  AND i.due_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '7 days');


-- Recent activity log view (combined audit and notifications)
CREATE OR REPLACE VIEW vw_recent_activity_log AS
SELECT
    'AUDIT' AS activity_type,
    changed_at AS activity_date,
    table_name || ' ' || action AS activity_title,
    'Record ID: ' || record_id AS description
FROM audit_logs
UNION ALL
SELECT
    'NOTIFICATION' AS activity_type,
    sent_at AS activity_date,
    title AS activity_title,
    message AS description
FROM notifications
ORDER BY activity_date DESC;
