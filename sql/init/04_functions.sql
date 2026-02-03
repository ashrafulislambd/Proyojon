-- =============================================
-- CREDIT SCORE & UTILITY FUNCTIONS
-- =============================================

-- Calculate credit score based on user payment history
CREATE OR REPLACE FUNCTION calculate_credit_score_func(p_user_id INT)
RETURNS INT AS $$
DECLARE
    v_base_score INT := 500;
    v_paid_installments INT;
    v_overdue_installments INT;
    v_order_count INT;
    v_final_score INT;
BEGIN
    -- Count paid installments (reward)
    SELECT COUNT(*) INTO v_paid_installments
    FROM installments i
    JOIN installment_plans ip ON i.plan_id = ip.id
    JOIN orders o ON ip.order_id = o.id
    WHERE o.user_id = p_user_id AND i.status = 'Paid';

    -- Count overdue installments (penalty)
    SELECT COUNT(*) INTO v_overdue_installments
    FROM installments i
    JOIN installment_plans ip ON i.plan_id = ip.id
    JOIN orders o ON ip.order_id = o.id
    WHERE o.user_id = p_user_id AND i.status = 'Overdue';

    -- Count completed orders
    SELECT COUNT(*) INTO v_order_count
    FROM orders WHERE user_id = p_user_id AND status = 'Delivered';

    -- Score calculation
    v_final_score := v_base_score
        + (v_paid_installments * 15)
        - (v_overdue_installments * 30)
        + (v_order_count * 10);

    -- Clamp between 300 and 850
    v_final_score := GREATEST(300, LEAST(850, v_final_score));

    -- Update or insert
    IF EXISTS (SELECT 1 FROM credit_scores WHERE user_id = p_user_id) THEN
        UPDATE credit_scores SET score = v_final_score, calculated_at = NOW()
        WHERE user_id = p_user_id;
    ELSE
        INSERT INTO credit_scores (user_id, score) VALUES (p_user_id, v_final_score);
    END IF;

    RETURN v_final_score;
END;
$$ LANGUAGE plpgsql;


-- Get monthly revenue trend for admin charts
CREATE OR REPLACE FUNCTION get_monthly_revenue_func(p_months INT DEFAULT 6)
RETURNS TABLE (
    month_label VARCHAR,
    revenue DECIMAL,
    order_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(DATE_TRUNC('month', o.created_at), 'Mon YYYY') AS month_label,
        COALESCE(SUM(o.total_amount), 0) AS revenue,
        COUNT(*) AS order_count
    FROM orders o
    WHERE o.created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month' * p_months)
      AND o.status != 'Cancelled'
    GROUP BY DATE_TRUNC('month', o.created_at)
    ORDER BY DATE_TRUNC('month', o.created_at) ASC;
END;
$$ LANGUAGE plpgsql;


-- Check stock availability before placing order
CREATE OR REPLACE FUNCTION check_stock_availability_func(
    p_items JSONB
)
RETURNS TABLE (
    available BOOLEAN,
    unavailable_product VARCHAR
) AS $$
DECLARE
    v_item JSONB;
    v_product_id INT;
    v_quantity INT;
    v_stock INT;
    v_product_name VARCHAR;
BEGIN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'productId')::INT;
        v_quantity   := (v_item->>'quantity')::INT;

        SELECT p.stock_quantity, p.name INTO v_stock, v_product_name
        FROM products p WHERE p.id = v_product_id;

        IF v_stock < v_quantity THEN
            RETURN QUERY SELECT FALSE, v_product_name;
            RETURN;
        END IF;
    END LOOP;

    RETURN QUERY SELECT TRUE, NULL::VARCHAR;
END;
$$ LANGUAGE plpgsql;
