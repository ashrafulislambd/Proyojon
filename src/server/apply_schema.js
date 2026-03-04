/**
 * apply_schema.js
 * Applies all SQL files to the database in the correct order.
 * Run: node src/server/apply_schema.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), override: true });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'proyojon_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
});

const SQL_DIR = path.resolve(__dirname, '../../sql');

// Apply in dependency order
const SQL_FILES = [
    'schema.sql',      // Tables
    'admin_auth.sql',  // Admin auth function (needs pgcrypto)
    'auth.sql',        // User auth functions
    'views.sql',       // Views (needed by functions)
    'functions.sql',   // Utility functions
    'bnpl_functions.sql', // Core BNPL logic
    'procedures.sql',  // Stored procedures (if any)
    'triggers.sql',    // Triggers (after functions exist)
    'constraints.sql', // Indexes and constraints
    'seed.sql',        // Seed data (last)
];

async function applyFile(client, filename) {
    const filepath = path.join(SQL_DIR, filename);
    if (!fs.existsSync(filepath)) {
        console.log(`⚠️  Skipping ${filename} (file not found)`);
        return;
    }
    const sql = fs.readFileSync(filepath, 'utf-8');
    await client.query(sql);
    console.log(`✅ Applied ${filename}`);
}

async function main() {
    const client = await pool.connect();
    try {
        console.log('🔄 Starting database setup...\n');
        for (const file of SQL_FILES) {
            try {
                await applyFile(client, file);
            } catch (err) {
                console.error(`❌ Error in ${file}: ${err.message}`);
                throw err;
            }
        }
        console.log('\n🎉 Database setup complete!');
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
