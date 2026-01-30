const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    database: process.env.DB_NAME || 'proyojon_db',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function debugAdmin() {
    try {
        console.log('--- Checking Admins Table ---');
        const res = await pool.query('SELECT id, name, email, password_hash FROM admins');
        console.log(res.rows);

        console.log('\n--- Testing Login Function with "hashed_secret_password" ---');
        const loginRes1 = await pool.query("SELECT * FROM login_admin_func('admin@proyojon.com', 'hashed_secret_password')");
        console.log('Result:', loginRes1.rows[0]);

        console.log('\n--- Testing Login Function with "admin123" ---');
        const loginRes2 = await pool.query("SELECT * FROM login_admin_func('admin@proyojon.com', 'admin123')");
        console.log('Result:', loginRes2.rows[0]);

        await pool.end();
    } catch (err) {
        console.error('Error:', err);
        await pool.end();
    }
}

debugAdmin();
