const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
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

        if (!new_user_id) {
            return res.status(400).json({ error: message });
        }

        res.json({ message, userId: new_user_id });
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

        const { user_id, user_name, user_role, message } = result.rows[0];

        if (!user_id) {
            return res.status(401).json({ error: message });
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

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
