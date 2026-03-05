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


-- Get user financial summary for dashboard
CREATE OR REPLACE FUNCTION get_user_financial_summary(p_user_id INT)
RETURNS JSONB AS $$
DECLARE
    v_total_debt DECIMAL;
    v_active_plans INT;
    v_next_due DATE;
    v_credit_score INT;
    v_result JSONB;
BEGIN
    SELECT COALESCE(SUM(outstanding_balance), 0) INTO v_total_debt
    FROM orders WHERE user_id = p_user_id AND status != 'Cancelled';

    SELECT COUNT(*) INTO v_active_plans
    FROM installment_plans ip
    JOIN orders o ON ip.order_id = o.id
    WHERE o.user_id = p_user_id AND o.status NOT IN ('Delivered', 'Cancelled');

    SELECT MIN(due_date) INTO v_next_due
    FROM installments i
    JOIN installment_plans ip ON i.plan_id = ip.id
    JOIN orders o ON ip.order_id = o.id
    WHERE o.user_id = p_user_id AND i.status = 'Pending';

    SELECT score INTO v_credit_score
    FROM credit_scores WHERE user_id = p_user_id
    ORDER BY calculated_at DESC LIMIT 1;

    v_result := jsonb_build_object(
        'total_debt', v_total_debt,
        'active_plans', v_active_plans,
        'next_due_date', v_next_due,
        'credit_score', COALESCE(v_credit_score, 500)
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;


-- Check if user is eligible for a specific BNPL purchase
CREATE OR REPLACE FUNCTION is_user_eligible_for_bnpl(p_user_id INT, p_amount DECIMAL)
RETURNS BOOLEAN AS $$
DECLARE
    v_remaining_credit DECIMAL;
    v_credit_score INT;
BEGIN
    -- Get remaining credit from the view
    SELECT remaining_credit, credit_score INTO v_remaining_credit, v_credit_score
    FROM vw_user_credit_health WHERE id = p_user_id;

    -- Eligibility criteria: enough credit and score > 500
    IF v_remaining_credit >= p_amount AND v_credit_score >= 500 THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;


-- Calculate late fee for an installment
CREATE OR REPLACE FUNCTION calculate_late_fee_func(p_installment_id INT)
RETURNS DECIMAL AS $$
DECLARE
    v_due_date DATE;
    v_amount DECIMAL;
    v_late_fee DECIMAL := 0.00;
BEGIN
    SELECT due_date, amount INTO v_due_date, v_amount
    FROM installments WHERE id = p_installment_id;

    -- If more than 3 days late, apply 5% fee
    IF v_due_date < (CURRENT_DATE - INTERVAL '3 days') THEN
        v_late_fee := v_amount * 0.05;
    END IF;

    RETURN v_late_fee;
END;
$$ LANGUAGE plpgsql;
