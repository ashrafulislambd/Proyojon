-- Admin Authentication Logic
-- DBMS: PostgreSQL

-- =========================================================
-- 1. Function: Login Admin
-- =========================================================
CREATE OR REPLACE FUNCTION login_admin_func(
    p_email VARCHAR,
    p_password VARCHAR
)
RETURNS TABLE (
    admin_id INT,
    admin_name VARCHAR,
    admin_role VARCHAR,
    message VARCHAR
) AS $$
DECLARE
    v_admin_record RECORD;
BEGIN
    -- Find admin by email
    SELECT a.id, a.name, r.name as role_name, a.password_hash 
    INTO v_admin_record
    FROM admins a
    JOIN roles r ON a.role_id = r.id
    WHERE a.email = p_email;

    -- Check if admin exists
    IF v_admin_record.id IS NULL THEN
        RETURN QUERY SELECT NULL::INT, NULL::VARCHAR, NULL::VARCHAR, 'Admin not found'::VARCHAR;
        RETURN;
    END IF;

    -- Verify password (Note: seed.sql uses 'hashed_secret_password', but for new ones we use crypt)
    -- Checking if it's a crypted hash or a plain string (for demo seed compatibility)
    IF v_admin_record.password_hash = p_password OR 
       v_admin_record.password_hash = crypt(p_password, v_admin_record.password_hash) THEN
        RETURN QUERY SELECT v_admin_record.id, v_admin_record.name, v_admin_record.role_name::VARCHAR, 'Login successful'::VARCHAR;
    ELSE
        RETURN QUERY SELECT NULL::INT, NULL::VARCHAR, NULL::VARCHAR, 'Invalid password'::VARCHAR;
    END IF;
END;
$$ LANGUAGE plpgsql;
