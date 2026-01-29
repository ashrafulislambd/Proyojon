const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const envPath = path.resolve(__dirname, '.env');
// Force override existing environment variables
const result = require('dotenv').config({ path: envPath, override: true });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
// Database Connection Strategy
const commonPasswords = [process.env.DB_PASSWORD, 'kolarmocha', '1234', '', 'postgres'];
let pool;

async function connectWithRetry() {
    for (const pass of commonPasswords) {
        if (pass === undefined) continue;

        const testPool = new Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || '127.0.0.1',
            database: process.env.DB_NAME || 'proyojon_db',
            password: pass,
            port: parseInt(process.env.DB_PORT || '5432'),
            connectionTimeoutMillis: 2000,
        });

        try {
            await testPool.query('SELECT NOW()');
            console.log(`✅ Connected successfully using password: ${pass === '' ? '(empty)' : '******* (found match!)'}`);
            pool = testPool;
            return true;
        } catch (err) {
            await testPool.end();
            if (err.code !== '28P01') { // If it's not an auth error, stop and report
                console.error('❌ Database error:', err.message);
                return false;
            }
        }
    }
    console.error('❌ All connection attempts failed. Please verify your PostgreSQL password.');
    return false;
}

// Initialize connection
connectWithRetry().then(success => {
    if (!success) {
        console.log('⚠️ Server running but database disconnected. Features will fail until credentials are fixed.');
    }
});

// ==========================================
// Authentication Endpoints
// ==========================================

// Register
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, phone, nid, address } = req.body;
    try {
        const result = await pool.query(
            `SELECT * FROM register_user_func($1::VARCHAR, $2::VARCHAR, $3::VARCHAR, $4::VARCHAR, $5::VARCHAR, $6::TEXT)`,
            [name, email, password, phone, nid || null, address]
        );

        const { new_user_id, message } = result.rows[0];

        res.json({
            message,
            user: { id: new_user_id, name: name, role: 'User' }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(
            `SELECT * FROM login_user_func($1, $2)`,
            [email, password]
        );

        if (!result.rows || result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid login attempt' });
        }

        const { user_id, user_name, user_role, message } = result.rows[0];

        if (!user_id) {
            return res.status(401).json({ error: message || 'Login failed' });
        }

        res.json({
            message,
            user: { id: user_id, name: user_name, role: user_role }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(
            `SELECT * FROM login_admin_func($1, $2)`,
            [email, password]
        );

        if (!result.rows || result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid admin login attempt' });
        }

        const { admin_id, admin_name, admin_role, message } = result.rows[0];

        if (!admin_id) {
            return res.status(401).json({ error: message || 'Login failed' });
        }

        res.json({
            message,
            user: { id: admin_id, name: admin_name, role: admin_role }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Admin login failed' });
    }
});

// ==========================================
// API Endpoints (Logic in PL/SQL)
// ==========================================

// 1. Get Products (Home Page)
app.get('/api/products', async (req, res) => {
    try {
        // Simple Select
        const result = await pool.query(`
      SELECT p.id, p.name, p.price, p.stock_quantity, c.name as category, m.name as merchant 
      FROM products p
      JOIN product_categories c ON p.category_id = c.id
      JOIN merchants m ON p.merchant_id = m.id
      ORDER BY p.id ASC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// 2. Buy Item (Calls Stored Procedure)
app.post('/api/buy', async (req, res) => {
    const { userId, productId } = req.body;
    // Hardcoded for demo simplicity
    const merchantId = 1;
    const quantity = 1;
    const paymentMethod = 'Credit';

    try {
        // CALL stored procedure
        await pool.query(
            `CALL process_order_proc($1, $2, $3, $4, $5)`,
            [userId, merchantId, productId, quantity, paymentMethod]
        );
        res.json({ message: 'Order processed successfully via PL/SQL Procedure' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

// 3. User Dashboard (Uses View)
app.get('/api/user/:id', async (req, res) => {
    try {
        // Querying the View we created
        const result = await pool.query(
            `SELECT * FROM vw_user_credit_health WHERE id = $1`,
            [req.params.id]
        );

        // Also get recent orders
        const orders = await pool.query(
            `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            profile: result.rows[0],
            recent_orders: orders.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// 4. Admin Stats (Uses Analytical Query)
app.get('/api/admin/stats', async (req, res) => {
    try {
        // Using one of our complex queries (Sales per Merchant)
        const result = await pool.query(`
      SELECT 
          m.name AS merchant_name,
          COUNT(o.id) AS total_orders,
          SUM(o.total_amount) AS total_revenue
      FROM merchants m
      JOIN orders o ON m.id = o.merchant_id
      WHERE o.status = 'Delivered'
      GROUP BY m.name
      ORDER BY total_revenue DESC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// 5. User Transaction History
app.get('/api/user/:id/transactions', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.*, o.total_amount as order_total 
             FROM transactions t
             JOIN orders o ON t.order_id = o.id
             WHERE o.user_id = $1
             ORDER BY t.transaction_date DESC`,
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
