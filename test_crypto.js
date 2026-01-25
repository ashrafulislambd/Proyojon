const { Pool } = require('pg');
require('dotenv').config({ path: 'src/server/.env' });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'proyojon_db',
    password: process.env.DB_PASSWORD || '1234',
    port: process.env.DB_PORT || 5432,
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
