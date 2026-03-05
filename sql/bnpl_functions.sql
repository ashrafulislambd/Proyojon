-- =============================================
-- BNPL CORE BUSINESS LOGIC FUNCTIONS
-- =============================================

-- Get all products with category and merchant info
CREATE OR REPLACE FUNCTION get_products_func()
RETURNS TABLE (
    id INT,
    name VARCHAR,
    description TEXT,
    brand VARCHAR,
    price DECIMAL,
    stock INT,
    image_url VARCHAR,
    bnpl_eligible BOOLEAN,
    category VARCHAR,
    seller VARCHAR,
    merchant_id INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.brand,
        p.price,
        p.stock_quantity,
        p.image_url,
        p.bnpl_eligible,
        c.name AS category,
        m.name AS seller,
        m.id AS merchant_id
    FROM products p
    JOIN product_categories c ON p.category_id = c.id
    JOIN merchants m ON p.merchant_id = m.id
    WHERE p.stock_quantity > 0
    ORDER BY p.id ASC;
END;
$$ LANGUAGE plpgsql;


-- Get a single product by ID
CREATE OR REPLACE FUNCTION get_product_func(p_id INT)
RETURNS TABLE (
    id INT,
    name VARCHAR,
    description TEXT,
    brand VARCHAR,
    price DECIMAL,
    stock INT,
    image_url VARCHAR,
    bnpl_eligible BOOLEAN,
    category VARCHAR,
    seller VARCHAR,
    merchant_id INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.brand,
        p.price,
        p.stock_quantity,
        p.image_url,
        p.bnpl_eligible,
        c.name AS category,
        m.name AS seller,
        m.id AS merchant_id
    FROM products p
    JOIN product_categories c ON p.category_id = c.id
    JOIN merchants m ON p.merchant_id = m.id
    WHERE p.id = p_id;
END;
$$ LANGUAGE plpgsql;


-- Get user profile with latest credit score
CREATE OR REPLACE FUNCTION get_user_profile_func(p_user_id INT)
RETURNS TABLE (
    id INT,
    name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    address TEXT,
    city VARCHAR,
    zip_code VARCHAR,
    credit_limit DECIMAL,
    kyc_status VARCHAR,
    email_verified BOOLEAN,
    phone_verified BOOLEAN,
    credit_score INT,
    remaining_credit DECIMAL,
    total_due DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM vw_user_credit_health WHERE vw_user_credit_health.id = p_user_id;
END;
$$ LANGUAGE plpgsql;


-- Update user profile
CREATE OR REPLACE FUNCTION update_user_profile_func(
    p_user_id INT,
    p_name VARCHAR,
    p_phone VARCHAR,
    p_address TEXT,
    p_city VARCHAR,
    p_zip_code VARCHAR
)
RETURNS VARCHAR AS $$
BEGIN
    UPDATE users
    SET 
        name = COALESCE(p_name, name),
        phone = COALESCE(p_phone, phone),
        address = COALESCE(p_address, address),
        city = COALESCE(p_city, city),
        zip_code = COALESCE(p_zip_code, zip_code)
    WHERE id = p_user_id;

    RETURN 'Profile updated successfully';
END;
$$ LANGUAGE plpgsql;


-- Create an order with BNPL plan — the heart of the system
CREATE OR REPLACE FUNCTION create_order_func(
    p_user_id INT,
    p_payment_plan VARCHAR,  -- 'full', '3months', '6months', '12months'
    p_items JSONB,           -- [{productId, quantity, unitPrice}...]
    p_payment_method VARCHAR DEFAULT 'Card'
)
RETURNS TABLE (
    order_id INT,
    message VARCHAR
) AS $$
DECLARE
    v_order_id INT;
    v_transaction_id INT;
    v_plan_id INT;
    v_total DECIMAL := 0;
    v_interest_rate DECIMAL := 0;
    v_num_installments INT := 1;
    v_total_with_interest DECIMAL;
    v_monthly_amount DECIMAL;
    v_first_payment DECIMAL;
    v_outstanding DECIMAL;
    v_credit_score INT;
    v_credit_limit DECIMAL;
    v_item JSONB;
    v_product_id INT;
    v_quantity INT;
    v_unit_price DECIMAL;
    v_merchant_id INT;
    v_i INT;
BEGIN
    -- Get user credit info
    SELECT COALESCE((SELECT score FROM credit_scores WHERE user_id = p_user_id ORDER BY calculated_at DESC LIMIT 1), 720),
           u.credit_limit
    INTO v_credit_score, v_credit_limit
    FROM users u WHERE u.id = p_user_id;

    -- Calculate order total from items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_unit_price := (v_item->>'unitPrice')::DECIMAL;
        v_quantity   := (v_item->>'quantity')::INT;
        v_total := v_total + (v_unit_price * v_quantity);
    END LOOP;

    -- BNPL eligibility guard (only applies to non-full plans)
    IF p_payment_plan != 'full' THEN
        IF v_credit_score < 500 THEN
            RETURN QUERY SELECT NULL::INT, 'Credit score too low for BNPL. Minimum required: 500'::VARCHAR;
            RETURN;
        END IF;
        IF v_total > v_credit_limit THEN
            RETURN QUERY SELECT NULL::INT, ('Order total exceeds your credit limit of ' || v_credit_limit::TEXT)::VARCHAR;
            RETURN;
        END IF;
    END IF;

    -- Determine installment parameters
    CASE p_payment_plan
        WHEN '3months'  THEN v_interest_rate := 0;   v_num_installments := 3;
        WHEN '6months'  THEN v_interest_rate := 5;   v_num_installments := 6;
        WHEN '12months' THEN v_interest_rate := 10;  v_num_installments := 12;
        ELSE                 v_interest_rate := 0;   v_num_installments := 1; -- full pay
    END CASE;

    v_total_with_interest := v_total * (1 + v_interest_rate / 100.0);
    v_monthly_amount := ROUND(v_total_with_interest / v_num_installments, 2);

    -- Get merchant from first item
    SELECT p.merchant_id INTO v_merchant_id
    FROM products p
    WHERE p.id = ((p_items->0->>'productId')::INT);

    -- Insert order
    INSERT INTO orders (user_id, merchant_id, total_amount, outstanding_balance, payment_plan, status, credit_score_used)
    VALUES (p_user_id, v_merchant_id, v_total_with_interest,
            CASE WHEN p_payment_plan = 'full' THEN 0 ELSE v_total_with_interest - v_monthly_amount END,
            p_payment_plan, 'Confirmed', v_credit_score)
    RETURNING id INTO v_order_id;

    -- Insert order items and reduce stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'productId')::INT;
        v_quantity   := (v_item->>'quantity')::INT;
        v_unit_price := (v_item->>'unitPrice')::DECIMAL;

        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
        VALUES (v_order_id, v_product_id, v_quantity, v_unit_price);

        -- Reduce stock (trigger also does this, but explicit here for correctness)
        UPDATE products SET stock_quantity = stock_quantity - v_quantity WHERE id = v_product_id;
    END LOOP;

    -- Insert initial transaction (first installment payment)
    INSERT INTO transactions (order_id, amount, payment_method, type, status, receipt)
    VALUES (v_order_id, v_monthly_amount, p_payment_method, 'payment', 'Success', 'RCPT-' || v_order_id || '-1')
    RETURNING id INTO v_transaction_id;

    -- If installment plan, create plan and remaining installments
    IF p_payment_plan != 'full' THEN
        INSERT INTO installment_plans (transaction_id, order_id, total_installments, interest_rate, monthly_amount)
        VALUES (v_transaction_id, v_order_id, v_num_installments, v_interest_rate, v_monthly_amount)
        RETURNING id INTO v_plan_id;

        -- First installment is already paid
        INSERT INTO installments (plan_id, installment_number, due_date, amount, status, paid_at)
        VALUES (v_plan_id, 1, CURRENT_DATE, v_monthly_amount, 'Paid', NOW());

        -- Remaining installments
        FOR v_i IN 2..v_num_installments LOOP
            INSERT INTO installments (plan_id, installment_number, due_date, amount, status)
            VALUES (v_plan_id, v_i, CURRENT_DATE + ((v_i - 1) * 30), v_monthly_amount, 'Pending');
        END LOOP;
    END IF;

    -- Update merchant sales
    UPDATE merchants SET
        total_sales = total_sales + v_total_with_interest,
        pending_settlement = pending_settlement + v_total_with_interest
    WHERE id = v_merchant_id;

    -- Send success notification
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (p_user_id, 'payment_success', 'Order Placed Successfully',
        'Your order #' || v_order_id || ' has been placed for $' || ROUND(v_total_with_interest, 2) ||
        CASE WHEN p_payment_plan != 'full' THEN '. Your first installment of $' || v_monthly_amount || ' has been charged.' ELSE '.' END);

    RETURN QUERY SELECT v_order_id, 'Order created successfully'::VARCHAR;
END;
$$ LANGUAGE plpgsql;


-- Get all orders for a user (with installments)
CREATE OR REPLACE FUNCTION get_user_orders_func(p_user_id INT)
RETURNS TABLE (
    order_id INT,
    total_amount DECIMAL,
    outstanding_balance DECIMAL,
    payment_plan VARCHAR,
    status VARCHAR,
    created_at TIMESTAMP,
    credit_score_used INT,
    items JSONB,
    installment_info JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.total_amount,
        o.outstanding_balance,
        o.payment_plan,
        o.status,
        o.created_at,
        o.credit_score_used,
        (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'name', p.name,
                'quantity', oi.quantity,
                'unitPrice', oi.unit_price,
                'image', p.image_url
            )), '[]'::JSONB)
            FROM order_items oi JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = o.id
        ) AS items,
        (
            SELECT COALESCE(jsonb_build_object(
                'planId', ip.id,
                'totalInstallments', ip.total_installments,
                'interestRate', ip.interest_rate,
                'monthlyAmount', ip.monthly_amount,
                'installments', (
                    SELECT COALESCE(jsonb_agg(jsonb_build_object(
                        'id', i.id,
                        'number', i.installment_number,
                        'amount', i.amount,
                        'dueDate', i.due_date,
                        'status', i.status,
                        'paidAt', i.paid_at
                    ) ORDER BY i.installment_number), '[]'::JSONB)
                    FROM installments i WHERE i.plan_id = ip.id
                )
            ), NULL)
            FROM installment_plans ip WHERE ip.order_id = o.id
        ) AS installment_info
    FROM orders o
    WHERE o.user_id = p_user_id
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql;


-- Pay a specific installment
CREATE OR REPLACE FUNCTION pay_installment_func(
    p_installment_id INT,
    p_user_id INT
)
RETURNS VARCHAR AS $$
DECLARE
    v_plan_id INT;
    v_order_id INT;
    v_amount DECIMAL;
    v_current_status VARCHAR;
    v_remaining_count INT;
    v_paid_count INT;
BEGIN
    -- Get installment details
    SELECT i.plan_id, i.amount, i.status INTO v_plan_id, v_amount, v_current_status
    FROM installments i WHERE i.id = p_installment_id;

    IF v_current_status = 'Paid' THEN
        RETURN 'Installment already paid';
    END IF;

    -- Get order_id from plan
    SELECT order_id INTO v_order_id FROM installment_plans WHERE id = v_plan_id;

    -- Verify the order belongs to this user
    IF NOT EXISTS (SELECT 1 FROM orders WHERE id = v_order_id AND user_id = p_user_id) THEN
        RETURN 'Unauthorized: this installment does not belong to you';
    END IF;

    -- Mark installment as Paid
    UPDATE installments SET status = 'Paid', paid_at = NOW() WHERE id = p_installment_id;

    -- Record transaction
    INSERT INTO transactions (order_id, amount, payment_method, type, status, receipt)
    VALUES (v_order_id, v_amount, 'Card', 'payment', 'Success',
            'RCPT-' || v_order_id || '-INST-' || p_installment_id);

    -- Update order outstanding balance
    UPDATE orders SET outstanding_balance = GREATEST(0, outstanding_balance - v_amount)
    WHERE id = v_order_id;

    -- Check if all installments paid; if so, close the order
    SELECT COUNT(*) FILTER (WHERE status != 'Paid'), COUNT(*) FILTER (WHERE status = 'Paid')
    INTO v_remaining_count, v_paid_count
    FROM installments WHERE plan_id = v_plan_id;

    IF v_remaining_count = 0 THEN
        UPDATE orders SET status = 'Delivered', outstanding_balance = 0 WHERE id = v_order_id;
    END IF;

    -- Recalculate credit score (reward for on-time payment)
    PERFORM calculate_credit_score_func(p_user_id);

    -- Send notification
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (p_user_id, 'payment_success', 'Payment Successful',
        'Your installment payment of $' || v_amount || ' for order #' || v_order_id || ' was processed.');

    RETURN 'Payment successful';
END;
$$ LANGUAGE plpgsql;


-- Get notifications for a user
CREATE OR REPLACE FUNCTION get_notifications_func(p_user_id INT)
RETURNS TABLE (
    id INT,
    type VARCHAR,
    title VARCHAR,
    message TEXT,
    is_read BOOLEAN,
    sent_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT n.id, n.type, n.title, n.message, n.is_read, n.sent_at
    FROM notifications n
    WHERE n.user_id = p_user_id
    ORDER BY n.sent_at DESC;
END;
$$ LANGUAGE plpgsql;


-- Mark a notification as read
CREATE OR REPLACE FUNCTION mark_notification_read_func(p_notif_id INT)
RETURNS VARCHAR AS $$
BEGIN
    UPDATE notifications SET is_read = TRUE WHERE id = p_notif_id;
    RETURN 'Notification marked as read';
END;
$$ LANGUAGE plpgsql;


-- =============================================
-- ADMIN FUNCTIONS
-- =============================================

-- Admin comprehensive stats
CREATE OR REPLACE FUNCTION get_admin_stats_func()
RETURNS TABLE (
    total_users BIGINT,
    total_merchants BIGINT,
    total_orders BIGINT,
    total_revenue DECIMAL,
    total_outstanding DECIMAL,
    overdue_installments BIGINT,
    active_plans BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM users),
        (SELECT COUNT(*) FROM merchants),
        (SELECT COUNT(*) FROM orders WHERE status != 'Cancelled'),
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'Cancelled'),
        (SELECT COALESCE(SUM(outstanding_balance), 0) FROM orders),
        (SELECT COUNT(*) FROM installments WHERE status = 'Overdue'),
        (SELECT COUNT(DISTINCT plan_id) FROM installments WHERE status = 'Pending');
END;
$$ LANGUAGE plpgsql;


-- Get all users for admin
CREATE OR REPLACE FUNCTION get_all_users_func()
RETURNS TABLE (
    id INT,
    name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    credit_limit DECIMAL,
    kyc_status VARCHAR,
    email_verified BOOLEAN,
    phone_verified BOOLEAN,
    credit_score INT,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id, u.name, u.email, u.phone, u.credit_limit, u.kyc_status,
        u.email_verified, u.phone_verified,
        COALESCE((SELECT score FROM credit_scores WHERE user_id = u.id ORDER BY calculated_at DESC LIMIT 1), 500),
        u.created_at
    FROM users u
    ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;


-- Get all merchants for admin
CREATE OR REPLACE FUNCTION get_all_merchants_func()
RETURNS TABLE (
    id INT,
    name VARCHAR,
    type VARCHAR,
    contact_email VARCHAR,
    verified BOOLEAN,
    total_sales DECIMAL,
    pending_settlement DECIMAL,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.name, m.type, m.contact_email, m.verified,
           m.total_sales, m.pending_settlement, m.created_at
    FROM merchants m
    ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql;


-- Verify a merchant
CREATE OR REPLACE FUNCTION verify_merchant_func(p_merchant_id INT)
RETURNS VARCHAR AS $$
BEGIN
    UPDATE merchants SET verified = TRUE, verified_at = NOW() WHERE id = p_merchant_id;

    INSERT INTO audit_logs (table_name, action, record_id, changed_by)
    VALUES ('merchants', 'UPDATE', p_merchant_id, 'Admin');

    RETURN 'Merchant verified successfully';
END;
$$ LANGUAGE plpgsql;


-- Process merchant settlement
CREATE OR REPLACE FUNCTION process_settlement_func(p_merchant_id INT)
RETURNS VARCHAR AS $$
DECLARE
    v_amount DECIMAL;
BEGIN
    SELECT pending_settlement INTO v_amount FROM merchants WHERE id = p_merchant_id;

    IF v_amount IS NULL OR v_amount <= 0 THEN
        RETURN 'No pending settlement for this merchant';
    END IF;

    INSERT INTO settlements (merchant_id, amount, status)
    VALUES (p_merchant_id, v_amount, 'Completed');

    UPDATE merchants SET pending_settlement = 0 WHERE id = p_merchant_id;

    INSERT INTO audit_logs (table_name, action, record_id, changed_by)
    VALUES ('settlements', 'INSERT', p_merchant_id, 'Admin');

    RETURN 'Settlement of $' || v_amount || ' processed successfully';
END;
$$ LANGUAGE plpgsql;


-- Get audit logs
CREATE OR REPLACE FUNCTION get_audit_logs_func()
RETURNS TABLE (
    id INT,
    table_name VARCHAR,
    action VARCHAR,
    record_id INT,
    changed_by VARCHAR,
    changed_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT a.id, a.table_name, a.action, a.record_id, a.changed_by, a.changed_at
    FROM audit_logs a
    ORDER BY a.changed_at DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;


-- Get seller products by merchant
CREATE OR REPLACE FUNCTION get_seller_products_func(p_merchant_id INT)
RETURNS TABLE (
    id INT,
    name VARCHAR,
    description TEXT,
    brand VARCHAR,
    price DECIMAL,
    stock INT,
    image_url VARCHAR,
    bnpl_eligible BOOLEAN,
    category VARCHAR,
    total_sold BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id, p.name, p.description, p.brand, p.price,
        p.stock_quantity, p.image_url, p.bnpl_eligible,
        c.name AS category,
        COALESCE(SUM(oi.quantity), 0)::BIGINT AS total_sold
    FROM products p
    JOIN product_categories c ON p.category_id = c.id
    LEFT JOIN order_items oi ON oi.product_id = p.id
    WHERE p.merchant_id = p_merchant_id
    GROUP BY p.id, p.name, p.description, p.brand, p.price,
             p.stock_quantity, p.image_url, p.bnpl_eligible, c.name
    ORDER BY p.id;
END;
$$ LANGUAGE plpgsql;


-- Revenue per merchant (for admin analytics)
CREATE OR REPLACE FUNCTION get_merchant_revenue_func()
RETURNS TABLE (
    merchant_name VARCHAR,
    total_orders BIGINT,
    total_revenue DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.name, COUNT(o.id), COALESCE(SUM(o.total_amount), 0)
    FROM merchants m
    LEFT JOIN orders o ON m.id = o.merchant_id AND o.status != 'Cancelled'
    GROUP BY m.name
    ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql;


-- Revenue by payment plan (for admin analytics)
CREATE OR REPLACE FUNCTION get_revenue_by_plan_func()
RETURNS TABLE (
    payment_plan VARCHAR,
    order_count BIGINT,
    total_revenue DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT o.payment_plan, COUNT(*), COALESCE(SUM(o.total_amount), 0)
    FROM orders o
    WHERE o.status != 'Cancelled'
    GROUP BY o.payment_plan;
END;
$$ LANGUAGE plpgsql;
