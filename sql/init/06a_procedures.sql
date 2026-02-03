CREATE OR REPLACE PROCEDURE process_order_proc(
    p_user_id INT,
    p_merchant_id INT,
    p_product_id INT,
    p_quantity INT,
    p_payment_method VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_unit_price DECIMAL(10, 2);
    v_total_amount DECIMAL(10, 2);
    v_order_id INT;
BEGIN
    IF NOT check_stock_availability_func(p_product_id, p_quantity) THEN
        RAISE EXCEPTION 'Insufficient stock for product id %', p_product_id;
    END IF;

    SELECT price INTO v_unit_price FROM products WHERE id = p_product_id;
    v_total_amount := v_unit_price * p_quantity;

    INSERT INTO orders (user_id, merchant_id, total_amount, status)
    VALUES (p_user_id, p_merchant_id, v_total_amount, 'Pending')
    RETURNING id INTO v_order_id;

    INSERT INTO order_items (order_id, product_id, quantity, unit_price)
    VALUES (v_order_id, p_product_id, p_quantity, v_unit_price);

    INSERT INTO transactions (order_id, amount, payment_method, status)
    VALUES (v_order_id, v_total_amount, p_payment_method, 'Success');

    RAISE NOTICE 'Order % processed successfully.', v_order_id;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Transaction rolled back due to error: %', SQLERRM;
        ROLLBACK;
END;
$$;

CREATE OR REPLACE PROCEDURE generate_installments_proc(
    p_transaction_id INT,
    p_months INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_amount DECIMAL(10, 2);
    v_monthly_amount DECIMAL(10, 2);
    v_plan_id INT;
    v_interest_rate DECIMAL(5, 2) := 5.0;
    v_i INT;
BEGIN
    SELECT amount INTO v_total_amount FROM transactions WHERE id = p_transaction_id;
    
    IF v_total_amount IS NULL THEN
        RAISE EXCEPTION 'Transaction ID % not found', p_transaction_id;
    END IF;

    v_total_amount := v_total_amount * (1 + (v_interest_rate/100));
    v_monthly_amount := v_total_amount / p_months;

    INSERT INTO installment_plans (transaction_id, total_installments, interest_rate)
    VALUES (p_transaction_id, p_months, v_interest_rate)
    RETURNING id INTO v_plan_id;

    FOR v_i IN 1..p_months LOOP
        INSERT INTO installments (plan_id, due_date, amount, status)
        VALUES (
            v_plan_id, 
            CURRENT_DATE + (v_i * 30), 
            v_monthly_amount,
            'Pending'
        );
    END LOOP;

    RAISE NOTICE 'Generated % installments for plan %', p_months, v_plan_id;
END;
$$;

CREATE OR REPLACE PROCEDURE apply_late_fees_proc()
LANGUAGE plpgsql
AS $$
DECLARE
    v_penalty_rate DECIMAL(10, 2) := 100.00; -- Flat fee
    c_overdue_cursor CURSOR FOR 
        SELECT id, amount 
        FROM installments 
        WHERE due_date < CURRENT_DATE AND status = 'Pending';
    v_rec RECORD;
BEGIN
    OPEN c_overdue_cursor;
    
    LOOP
        FETCH c_overdue_cursor INTO v_rec;
        EXIT WHEN NOT FOUND;

        UPDATE installments
        SET amount = amount + v_penalty_rate,
            status = 'Overdue'
        WHERE id = v_rec.id;
        
        RAISE NOTICE 'Applied late fee to installment %', v_rec.id;
    END LOOP;
    
    CLOSE c_overdue_cursor;
END;
$$;
