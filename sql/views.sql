-- Proyojon Views
-- DBMS: PostgreSQL

-- =========================================================
-- 1. View: Merchant Performance Dashboard
-- Summary of sales, active products, and order counts per merchant
-- =========================================================
CREATE OR REPLACE VIEW vw_merchant_performance AS
SELECT 
    m.id AS merchant_id,
    m.name AS merchant_name,
    m.type,
    COUNT(DISTINCT p.id) AS total_products,
    COUNT(DISTINCT o.id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_revenue
FROM merchants m
LEFT JOIN products p ON m.id = p.merchant_id
LEFT JOIN orders o ON m.id = o.merchant_id AND o.status = 'Delivered'
GROUP BY m.id, m.name, m.type;

-- =========================================================
-- 2. View: User Credit Health
-- Shows user credit limit, spent amount (unpaid), and remaining credit
-- =========================================================
CREATE OR REPLACE VIEW vw_user_credit_health AS
WITH latest_scores AS (
    SELECT DISTINCT ON (user_id) user_id, score
    FROM credit_scores
    ORDER BY user_id, calculated_at DESC
)
SELECT 
    u.id,
    u.name,
    u.credit_limit,
    COALESCE(SUM(i.amount), 0) AS total_due_installments,
    (u.credit_limit - COALESCE(SUM(i.amount), 0)) AS remaining_credit,
    COALESCE(ls.score, 0) AS latest_credit_score
FROM users u
LEFT JOIN latest_scores ls ON u.id = ls.user_id
LEFT JOIN orders o ON u.id = o.user_id
LEFT JOIN transactions t ON o.id = t.order_id
LEFT JOIN installment_plans ip ON t.id = ip.transaction_id
LEFT JOIN installments i ON ip.id = i.plan_id AND i.status IN ('Pending', 'Overdue')
GROUP BY u.id, u.name, u.credit_limit, ls.score;

-- =========================================================
-- 3. View: Daily Revenue Report
-- Aggregated daily sales for fast reporting
-- =========================================================
CREATE OR REPLACE VIEW vw_daily_revenue AS
SELECT 
    DATE(transaction_date) AS date,
    payment_method,
    COUNT(id) AS transaction_count,
    SUM(amount) AS total_amount
FROM transactions
WHERE status = 'Success'
GROUP BY DATE(transaction_date), payment_method;
