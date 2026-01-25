const { Pool } = require('pg');
require('dotenv').config({ path: 'src/server/.env' });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'proyojon_db',
    password: process.env.DB_PASSWORD || '1234',
    port: process.env.DB_PORT || 5432,
});

async function run() {
    try {
        console.log('Connecting to DB...');
        // 1. Add column
        console.log('Checking password_hash column...');
        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
                    ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
                END IF;
            END $$;
        `);

        // 2. Extension
        console.log('Enabling pgcrypto...');
        await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

        // 3. Register Function
        console.log('Replacing register function...');
        await pool.query(`
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
                IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
                    RETURN QUERY SELECT NULL::INT, 'Email already exists'::VARCHAR;
                    RETURN;
                END IF;
                IF EXISTS (SELECT 1 FROM users WHERE phone = p_phone) THEN
                    RETURN QUERY SELECT NULL::INT, 'Phone already exists'::VARCHAR;
                    RETURN;
                END IF;
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
        `);

        // 4. Login Function
        console.log('Replacing login function...');
        await pool.query(`
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
        `);

        console.log('Database fix applied successfully!');
    } catch (err) {
        console.error('Error applying fix:', err);
    } finally {
        await pool.end();
    }
}

run();
