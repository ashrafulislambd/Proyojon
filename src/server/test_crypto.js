const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function test() {
    try {
        console.log('Testing pgcrypto...');
        const res = await pool.query("SELECT crypt('123456', gen_salt('bf')) as hash");
        console.log('Hash generated:', res.rows[0].hash);
    } catch (err) {
        console.error('PgCrypto Error:', err.message);
    } finally {
        pool.end();
    }
}

test();
