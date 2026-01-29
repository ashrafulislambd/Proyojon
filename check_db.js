const { Pool } = require('pg');
const path = require('path');

// Try to find the .env file
const envPath = path.resolve(__dirname, 'src/server/.env');
require('dotenv').config({ path: envPath });

const commonPasswords = [
    'kolarmocha',
    '1234',
    '',
    'postgres',
    'admin',
    'password',
    'root',
    '123456',
    'postgres123'
];

async function runDiagnostic() {
    console.log('=========================================');
    console.log('   PROYOJON DATABASE PASSWORD FINDER   ');
    console.log('=========================================');
    console.log(`Target User: ${process.env.DB_USER || 'postgres'}`);
    console.log(`Target DB:   ${process.env.DB_NAME || 'proyojon_db'}`);
    console.log(`Target Host: 127.0.0.1\n`);

    for (const pass of commonPasswords) {
        const displayPass = pass === '' ? '(empty)' : pass;
        process.stdout.write(`Testing password "${displayPass}"... `);

        const pool = new Pool({
            user: process.env.DB_USER || 'postgres',
            host: '127.0.0.1',
            database: process.env.DB_NAME || 'proyojon_db',
            password: pass,
            port: 5432,
            connectionTimeoutMillis: 1000,
        });

        try {
            await pool.query('SELECT 1');
            console.log('✅ SUCCESS!');
            console.log('\n-----------------------------------------');
            console.log(`FOUND IT! Your PostgreSQL password is: "${pass}"`);
            console.log(`Update your .env file with this password.`);
            console.log('-----------------------------------------');
            await pool.end();
            return;
        } catch (err) {
            console.log(`❌ FAILED`);
        } finally {
            await pool.end();
        }
    }

    console.log('\n-----------------------------------------');
    console.log('❌ Could not find the password automatically.');
    console.log('Please check your PostgreSQL installation for');
    console.log('the password you set for the "postgres" user.');
    console.log('-----------------------------------------');
}

runDiagnostic();
