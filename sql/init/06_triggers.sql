-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger function: Update installment status to Overdue on query
CREATE OR REPLACE FUNCTION mark_overdue_installments_tf()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE installments
    SET status = 'Overdue'
    WHERE status = 'Pending' AND due_date < CURRENT_DATE;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Run overdue check after any installment status query (on SELECT via event, or just call on demand)
-- We'll use a function-based approach called by API instead of a trigger on SELECT

-- Trigger function: Audit log on user changes
CREATE OR REPLACE FUNCTION audit_users_tf()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, action, record_id, old_data, new_data)
        VALUES ('users', 'UPDATE', NEW.id,
            row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB);
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, action, record_id, new_data)
        VALUES ('users', 'INSERT', NEW.id, row_to_json(NEW)::JSONB);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_audit_users
AFTER INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION audit_users_tf();


-- Trigger function: Audit log on order changes
CREATE OR REPLACE FUNCTION audit_orders_tf()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (table_name, action, record_id, old_data, new_data)
    VALUES (
        'orders',
        TG_OP,
        NEW.id,
        CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD)::JSONB ELSE NULL END,
        row_to_json(NEW)::JSONB
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_audit_orders
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION audit_orders_tf();


-- Trigger function: Send notification when installment becomes overdue
CREATE OR REPLACE FUNCTION notify_overdue_tf()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id INT;
    v_order_id INT;
BEGIN
    IF NEW.status = 'Overdue' AND OLD.status = 'Pending' THEN
        SELECT o.user_id, o.id INTO v_user_id, v_order_id
        FROM installment_plans ip
        JOIN orders o ON ip.order_id = o.id
        WHERE ip.id = NEW.plan_id;

        INSERT INTO notifications (user_id, type, title, message)
        VALUES (v_user_id, 'late_fee',
            'Payment Overdue',
            'Your installment #' || NEW.installment_number || ' of $' || NEW.amount ||
            ' for order #' || v_order_id || ' is overdue. A late fee may apply.');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_notify_overdue
AFTER UPDATE ON installments
FOR EACH ROW EXECUTE FUNCTION notify_overdue_tf();


-- Trigger: Prevent cancellation of a Delivered order
CREATE OR REPLACE FUNCTION prevent_cancel_delivered_tf()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'Delivered' AND NEW.status = 'Cancelled' THEN
        RAISE EXCEPTION 'Cannot cancel a delivered order';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_prevent_cancel_delivered
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION prevent_cancel_delivered_tf();


-- Function to refresh overdue installments (called by API periodically)
CREATE OR REPLACE FUNCTION refresh_overdue_installments()
RETURNS INT AS $$
DECLARE
    v_count INT;
BEGIN
    UPDATE installments
    SET status = 'Overdue'
    WHERE status = 'Pending' AND due_date < CURRENT_DATE;
    GET DIAGNOSTICS v_count = ROW_COUNT;

    -- Trigger notifications for newly overdue items (via the after-update trigger above)
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;
