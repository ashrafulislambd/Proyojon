-- =============================================
-- PROYOJON SQL EXTENSIONS
-- New Functions, Triggers, and Views
-- =============================================

-- =============================================
-- 1. FUNCTIONS
-- =============================================

-- Get a comprehensive JSON summary of user activity and status
CREATE OR REPLACE FUNCTION get_user_summary_json(p_user_id INT)
RETURNS JSONB AS $$
DECLARE
    v_summary JSONB;
BEGIN
    SELECT jsonb_build_object(
        'user_id', u.id,
        'name', u.name,
        'credit_score', COALESCE((SELECT score FROM credit_scores WHERE user_id = u.id ORDER BY calculated_at DESC LIMIT 1), 500),
        'total_orders', (SELECT COUNT(*) FROM orders WHERE user_id = u.id),
        'total_spent', COALESCE((SELECT SUM(total_amount) FROM orders WHERE user_id = u.id AND status != 'Cancelled'), 0),
        'outstanding_balance', COALESCE((SELECT SUM(outstanding_balance) FROM orders WHERE user_id = u.id), 0),
        'next_due_date', (
            SELECT MIN(due_date) 
            FROM installments i 
            JOIN installment_plans ip ON i.plan_id = ip.id 
            JOIN orders o ON ip.order_id = o.id 
            WHERE o.user_id = u.id AND i.status = 'Pending'
        ),
        'kyc_status', u.kyc_status
    ) INTO v_summary
    FROM users u
    WHERE u.id = p_user_id;
    
    RETURN v_summary;
END;
$$ LANGUAGE plpgsql;

-- Advanced product search with filters
CREATE OR REPLACE FUNCTION search_products_advanced(
    p_query TEXT DEFAULT NULL,
    p_category_id INT DEFAULT NULL,
    p_min_price DECIMAL DEFAULT NULL,
    p_max_price DECIMAL DEFAULT NULL
)
RETURNS TABLE (
    id INT,
    name VARCHAR,
    brand VARCHAR,
    price DECIMAL,
    category_name VARCHAR,
    merchant_name VARCHAR,
    stock_quantity INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, p.name, p.brand, p.price, 
        c.name AS category_name, 
        m.name AS merchant_name,
        p.stock_quantity
    FROM products p
    JOIN product_categories c ON p.category_id = c.id
    JOIN merchants m ON p.merchant_id = m.id
    WHERE (p_query IS NULL OR p.name ILIKE '%' || p_query || '%' OR p.description ILIKE '%' || p_query || '%')
      AND (p_category_id IS NULL OR p.category_id = p_category_id)
      AND (p_min_price IS NULL OR p.price >= p_min_price)
      AND (p_max_price IS NULL OR p.price <= p_max_price)
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Merchant performance dashboard summary
CREATE OR REPLACE FUNCTION get_merchant_dashboard_stats(p_merchant_id INT)
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'merchant_id', m.id,
        'total_sales', m.total_sales,
        'pending_settlement', m.pending_settlement,
        'total_products', (SELECT COUNT(*) FROM products WHERE merchant_id = m.id),
        'active_orders', (SELECT COUNT(*) FROM orders WHERE merchant_id = m.id AND status IN ('Confirmed', 'Shipped')),
        'low_stock_items', (SELECT COUNT(*) FROM products WHERE merchant_id = m.id AND stock_quantity < 10)
    ) INTO v_stats
    FROM merchants m
    WHERE m.id = p_merchant_id;
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql;


-- =============================================
-- 2. TRIGGERS
-- =============================================

-- Trigger: Notify merchant on low stock (< 5 units)
CREATE OR REPLACE FUNCTION notify_low_stock_tf()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_quantity < 5 AND OLD.stock_quantity >= 5 THEN
        -- Note: The system currently links notifications to users. 
        -- For merchants, we'd ideally have a merchant user ID, 
        -- but for now we'll log it or send it to all admins/relevant users if applicable.
        -- Assuming merchants themselves aren't directly in the 'users' table 
        -- we log an audit entry at minimum.
        INSERT INTO audit_logs (table_name, action, record_id, new_data, changed_by)
        VALUES ('products', 'LOW_STOCK', NEW.id, jsonb_build_object('name', NEW.name, 'stock', NEW.stock_quantity), 'System');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_product_stock_alert
AFTER UPDATE OF stock_quantity ON products
FOR EACH ROW EXECUTE FUNCTION notify_low_stock_tf();

-- Trigger: Audit prescription status changes
CREATE OR REPLACE FUNCTION log_prescription_status_tf()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO audit_logs (table_name, action, record_id, old_data, new_data, changed_by)
        VALUES ('prescriptions', 'UPDATE_STATUS', NEW.id, 
                jsonb_build_object('status', OLD.status), 
                jsonb_build_object('status', NEW.status), 
                'Admin');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_log_prescription_status
AFTER UPDATE OF status ON prescriptions
FOR EACH ROW EXECUTE FUNCTION log_prescription_status_tf();

-- Trigger: Send welcome notification to new users
CREATE OR REPLACE FUNCTION user_welcome_notification_tf()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (NEW.id, 'welcome', 'Welcome to Proyojon!', 'Thank you for joining Proyojon. Your initial credit limit is $' || NEW.credit_limit || '. Complete your KYC for full access.');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_user_welcome_notification
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION user_welcome_notification_tf();


-- =============================================
-- 3. VIEWS
-- =============================================

-- Detailed order report for administrative use
CREATE OR REPLACE VIEW vw_detailed_order_report AS
SELECT 
    o.id AS order_id,
    u.name AS customer_name,
    u.email AS customer_email,
    m.name AS merchant_name,
    o.total_amount,
    o.outstanding_balance,
    o.payment_plan,
    o.status AS order_status,
    o.created_at AS order_date,
    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS unique_items
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN merchants m ON o.merchant_id = m.id;

-- Merchant settlement status summary
CREATE OR REPLACE VIEW vw_merchant_settlement_status AS
SELECT 
    m.id AS merchant_id,
    m.name AS merchant_name,
    m.total_sales,
    m.pending_settlement,
    COALESCE((SELECT SUM(amount) FROM settlements WHERE merchant_id = m.id), 0) AS total_settled,
    (SELECT COUNT(*) FROM settlements WHERE merchant_id = m.id) AS settlement_count
FROM merchants m;

-- Top selling products ranked by quantity
CREATE OR REPLACE VIEW vw_top_selling_products AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    m.name AS merchant_name,
    c.name AS category_name,
    SUM(oi.quantity) AS total_quantity_sold,
    SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN merchants m ON p.merchant_id = m.id
JOIN product_categories c ON p.category_id = c.id
GROUP BY p.id, p.name, m.name, c.name
ORDER BY total_quantity_sold DESC;
