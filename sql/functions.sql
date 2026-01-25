-- Proyojon Stored Functions
-- DBMS: PostgreSQL

-- =========================================================
-- 1. Function: Calculate Credit Score
-- Logic: Base 300 + (Paid Installments * 10) - (Overdue Installments * 50)
-- =========================================================
CREATE OR REPLACE FUNCTION calculate_credit_score_func(p_user_id INT) 
RETURNS INT AS $$
DECLARE
    v_score INT;
    v_paid_count INT;
    v_overdue_count INT;
BEGIN
    -- Count paid installments
    SELECT COUNT(*) INTO v_paid_count
    FROM installments i
    JOIN installment_plans ip ON i.plan_id = ip.id
    JOIN transactions t ON ip.transaction_id = t.id
    JOIN orders o ON t.order_id = o.id
    WHERE o.user_id = p_user_id AND i.status = 'Paid';

    -- Count overdue installments
    SELECT COUNT(*) INTO v_overdue_count
    FROM installments i
    JOIN installment_plans ip ON i.plan_id = ip.id
    JOIN transactions t ON ip.transaction_id = t.id
    JOIN orders o ON t.order_id = o.id
    WHERE o.user_id = p_user_id AND i.status = 'Overdue';

    -- Calculation
    v_score := 300 + (v_paid_count * 10) - (v_overdue_count * 50);

    -- Clamp score between 300 and 850
    IF v_score > 850 THEN v_score := 850; END IF;
    IF v_score < 300 THEN v_score := 300; END IF;

    RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- 2. Function: Get Monthly Sales for Merchant
-- =========================================================
CREATE OR REPLACE FUNCTION get_monthly_sales_func(p_merchant_id INT, p_month INT, p_year INT)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    v_total_sales DECIMAL(10, 2);
BEGIN
    SELECT COALESCE(SUM(total_amount), 0) INTO v_total_sales
    FROM orders
    WHERE merchant_id = p_merchant_id
    AND EXTRACT(MONTH FROM created_at) = p_month
    AND EXTRACT(YEAR FROM created_at) = p_year
    AND status = 'Delivered';

    RETURN v_total_sales;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- 3. Function: Check Stock Availability
-- Returns TRUE if stock is sufficient, else FALSE
-- =========================================================
CREATE OR REPLACE FUNCTION check_stock_availability_func(p_product_id INT, p_qty INT)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_stock INT;
BEGIN
    SELECT stock_quantity INTO v_current_stock
    FROM products
    WHERE id = p_product_id;

    IF v_current_stock >= p_qty THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;
