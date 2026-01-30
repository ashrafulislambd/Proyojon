const { Pool } = require('pg');
const fs = require('fs');
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

async function applySql() {
    try {
        const files = [
            'schema.sql',
            'auth.sql',
            'admin_auth.sql',
            'constraints.sql',
            'seed.sql',
            'functions.sql',
            'procedures.sql',
            'triggers.sql',
            'views.sql'
        ];

        for (const file of files) {
            const filePath = path.resolve(__dirname, '../../sql', file);
            const sql = fs.readFileSync(filePath, 'utf8');
            console.log(`Applying ${file}...`);
            await pool.query(sql);
        }

        console.log('Database updated successfully.');
        await pool.end();
    } catch (err) {
        console.error('Error:', err);
        await pool.end();
    }
}

applySql();
