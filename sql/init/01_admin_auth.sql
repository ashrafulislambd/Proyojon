CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Admin login function
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
    v_admin RECORD;
BEGIN
    SELECT a.id, a.name, a.password_hash, r.name as role_name
    INTO v_admin
    FROM admins a
    LEFT JOIN roles r ON a.role_id = r.id
    WHERE a.email = LOWER(p_email);

    IF v_admin.id IS NULL THEN
        RETURN QUERY SELECT NULL::INT, NULL::VARCHAR, NULL::VARCHAR, 'Admin not found'::VARCHAR;
        RETURN;
    END IF;

    IF v_admin.password_hash = crypt(p_password, v_admin.password_hash) THEN
        RETURN QUERY SELECT v_admin.id, v_admin.name, COALESCE(v_admin.role_name, 'Admin')::VARCHAR, 'Admin login successful'::VARCHAR;
    ELSE
        RETURN QUERY SELECT NULL::INT, NULL::VARCHAR, NULL::VARCHAR, 'Invalid password'::VARCHAR;
    END IF;
END;
$$ LANGUAGE plpgsql;
