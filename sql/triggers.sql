CREATE OR REPLACE FUNCTION update_stock_tf() RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stock
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_stock_tf();

CREATE OR REPLACE FUNCTION audit_users_tf() RETURNS TRIGGER AS $$
DECLARE
    v_old_data JSONB;
    v_new_data JSONB;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_old_data = to_jsonb(OLD);
        INSERT INTO audit_logs (table_name, action, record_id, old_data)
        VALUES ('users', 'DELETE', OLD.id, v_old_data);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        v_old_data = to_jsonb(OLD);
        v_new_data = to_jsonb(NEW);
        INSERT INTO audit_logs (table_name, action, record_id, old_data, new_data)
        VALUES ('users', 'UPDATE', NEW.id, v_old_data, v_new_data);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        v_new_data = to_jsonb(NEW);
        INSERT INTO audit_logs (table_name, action, record_id, new_data)
        VALUES ('users', 'INSERT', NEW.id, v_new_data);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION audit_users_tf();

CREATE OR REPLACE FUNCTION check_credit_limit_tf() RETURNS TRIGGER AS $$
DECLARE
    v_current_due DECIMAL(10, 2);
    v_credit_limit DECIMAL(10, 2);
BEGIN
    SELECT credit_limit INTO v_credit_limit FROM users WHERE id = NEW.user_id;
    
    SELECT COALESCE(SUM(i.amount), 0) INTO v_current_due
    FROM installments i
    JOIN installment_plans ip ON i.plan_id = ip.id
    JOIN transactions t ON ip.transaction_id = t.id
    JOIN orders o ON t.order_id = o.id
    WHERE o.user_id = NEW.user_id 
    AND i.status IN ('Pending', 'Overdue');
    
    IF (v_current_due + NEW.total_amount) > v_credit_limit THEN
        RAISE EXCEPTION 'Credit limit exceeded. Limit: %, Current Due: %, New Order: %', 
            v_credit_limit, v_current_due, NEW.total_amount;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_credit_limit
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION check_credit_limit_tf();

CREATE OR REPLACE FUNCTION protect_closed_orders_tf() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IN ('Delivered', 'Cancelled') THEN
        RAISE EXCEPTION 'Cannot modify an order that is already %', OLD.status;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_modification_closed_order
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION protect_closed_orders_tf();
