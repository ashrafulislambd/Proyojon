const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'src/server/.env') });

const commonPasswords = [process.env.DB_PASSWORD, 'kolarmocha', '1234', '', 'postgres'];

async function verify() {
    console.log('--- Database Verification ---');

    let pool;
    let connected = false;

    for (const pass of commonPasswords) {
        if (pass === undefined) continue;
        console.log(`Attempting connection with password: ${pass === '' ? '(empty)' : '*******'}`);
        const testPool = new Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || '127.0.0.1',
            database: process.env.DB_NAME || 'proyojon_db',
            password: pass,
            port: 5432,
            connectionTimeoutMillis: 2000
        });

        try {
            await testPool.query('SELECT NOW()');
            pool = testPool;
            connected = true;
            console.log('✅ Connected!');
            break;
        } catch (err) {
            await testPool.end();
        }
    }

    if (!connected) {
        console.error('❌ Could not connect to database after all attempts.');
        process.exit(1);
    }

    try {
        const users = await pool.query('SELECT id, name, email FROM users;');
        console.log(`Users found: ${users.rowCount}`);
        users.rows.forEach(u => console.log(` - [ID: ${u.id}] ${u.name} (${u.email})`));

        const viewResult = await pool.query('SELECT * FROM vw_user_credit_health;');
        console.log(`Rows in vw_user_credit_health: ${viewResult.rowCount}`);
        viewResult.rows.forEach(r => console.log(` - User ID ${r.id}: Score ${r.latest_credit_score}, Limit ${r.credit_limit}`));

        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('Verification query failed:', err.message);
        await pool.end();
        process.exit(1);
    }
}

verify();
