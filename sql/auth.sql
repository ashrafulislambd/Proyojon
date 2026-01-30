CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION register_user_func(
    p_name VARCHAR,
    p_email VARCHAR,
    p_password VARCHAR,
    p_phone VARCHAR,
    p_nid VARCHAR,
    p_address TEXT
)
RETURNS TABLE (
    new_user_id INT,
    message VARCHAR
) AS $$
DECLARE
    v_user_id INT;
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
        RETURN QUERY SELECT NULL::INT, 'Email already exists'::VARCHAR;
        RETURN;
    END IF;

    IF EXISTS (SELECT 1 FROM users WHERE phone = p_phone) THEN
        RETURN QUERY SELECT NULL::INT, 'Phone already exists'::VARCHAR;
        RETURN;
    END IF;

    INSERT INTO users (name, email, password_hash, phone, nid_info, address, credit_limit)
    VALUES (
        p_name, 
        p_email, 
        crypt(p_password, gen_salt('bf')), 
        p_phone, 
        p_nid, 
        p_address,
        50000.00 
    )
    RETURNING id INTO v_user_id;

    INSERT INTO credit_scores (user_id, score)
    VALUES (v_user_id, 720);

    RETURN QUERY SELECT v_user_id, 'User registered successfully'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION login_user_func(
    p_email VARCHAR,
    p_password VARCHAR
)
RETURNS TABLE (
    user_id INT,
    user_name VARCHAR,
    user_role VARCHAR, 
    message VARCHAR
) AS $$
DECLARE
    v_user_record RECORD;
BEGIN
    SELECT id, name, password_hash INTO v_user_record
    FROM users
    WHERE email = p_email;

    IF v_user_record.id IS NULL THEN
        RETURN QUERY SELECT NULL::INT, NULL::VARCHAR, NULL::VARCHAR, 'User not found'::VARCHAR;
        RETURN;
    END IF;

    IF v_user_record.password_hash = crypt(p_password, v_user_record.password_hash) THEN
        RETURN QUERY SELECT v_user_record.id, v_user_record.name, 'User'::VARCHAR, 'Login successful'::VARCHAR;
    ELSE
        RETURN QUERY SELECT NULL::INT, NULL::VARCHAR, NULL::VARCHAR, 'Invalid password'::VARCHAR;
    END IF;
END;
$$ LANGUAGE plpgsql;
