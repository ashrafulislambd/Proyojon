-- Fix Database Schema and Functions
-- Run this to ensure everything is correct

-- 1. Add password_hash column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
    END IF;
END $$;

-- 2. Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Re-create Register Function
DROP FUNCTION IF EXISTS register_user_func;
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
    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
        RETURN QUERY SELECT NULL::INT, 'Email already exists'::VARCHAR;
        RETURN;
    END IF;

    -- Check if phone already exists
    IF EXISTS (SELECT 1 FROM users WHERE phone = p_phone) THEN
        RETURN QUERY SELECT NULL::INT, 'Phone already exists'::VARCHAR;
        RETURN;
    END IF;

    -- Insert new user
    INSERT INTO users (name, email, password_hash, phone, nid_info, address)
    VALUES (
        p_name, 
        p_email, 
        crypt(p_password, gen_salt('bf')), 
        p_phone, 
        p_nid, 
        p_address
    )
    RETURNING id INTO v_user_id;

    RETURN QUERY SELECT v_user_id, 'User registered successfully'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- 4. Re-create Login Function
DROP FUNCTION IF EXISTS login_user_func;
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
    -- Find user by email
    SELECT id, name, password_hash INTO v_user_record
    FROM users
    WHERE email = p_email;

    -- Check if user exists
    IF v_user_record.id IS NULL THEN
        RETURN QUERY SELECT NULL::INT, NULL::VARCHAR, NULL::VARCHAR, 'User not found'::VARCHAR;
        RETURN;
    END IF;

    -- Verify password
    IF v_user_record.password_hash = crypt(p_password, v_user_record.password_hash) THEN
        RETURN QUERY SELECT v_user_record.id, v_user_record.name, 'User'::VARCHAR, 'Login successful'::VARCHAR;
    ELSE
        RETURN QUERY SELECT NULL::INT, NULL::VARCHAR, NULL::VARCHAR, 'Invalid password'::VARCHAR;
    END IF;
END;
$$ LANGUAGE plpgsql;
