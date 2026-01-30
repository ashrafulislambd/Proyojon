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

async function checkProducts() {
    try {
        const res = await pool.query('SELECT name, image_url FROM products LIMIT 5');
        console.log('Products:', res.rows);
        await pool.end();
    } catch (err) {
        console.error('Error:', err);
        await pool.end();
    }
}

checkProducts();
