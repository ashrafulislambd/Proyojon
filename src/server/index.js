const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
// Try common .env locations: local dev (../../.env) or Docker (env vars already injected)
const envPaths = [
    path.resolve(__dirname, '../../.env'),  // local dev: run from src/server/
    path.resolve(__dirname, '.env'),         // Docker: run from /app/
    path.resolve(process.cwd(), '.env'),     // fallback
];
for (const ep of envPaths) {
    const result = require('dotenv').config({ path: ep });
    if (!result.error) break;
}


const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3001', 'http://frontend:80'],
    credentials: true,
}));
app.use(bodyParser.json());

// ==========================================
// Database Pool
// ==========================================
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'proyojon_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
});

pool.connect()
    .then(client => {
        console.log('✅ Database connected successfully');
        client.release();
        // Refresh overdue installments on startup
        pool.query('SELECT refresh_overdue_installments()').catch(console.error);
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

// Helper to call PLpgSQL function
const callFunc = async (funcCall, params = []) => {
    const result = await pool.query(`SELECT * FROM ${funcCall}`, params);
    return result.rows;
};

// Refresh overdue installments every 10 minutes
setInterval(() => {
    pool.query('SELECT refresh_overdue_installments()').catch(console.error);
}, 10 * 60 * 1000);

// ==========================================
// AUTH ENDPOINTS
// ==========================================

// Register
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, phone, nid, address } = req.body;
    if (!name || !email || !password || !phone) {
        return res.status(400).json({ error: 'Name, email, password, and phone are required' });
    }
    try {
        const rows = await callFunc(
            'register_user_func($1::VARCHAR, $2::VARCHAR, $3::VARCHAR, $4::VARCHAR, $5::VARCHAR, $6::TEXT)',
            [name, email, password, phone, nid || null, address || null]
        );
        const { new_user_id, message } = rows[0];
        if (!new_user_id) return res.status(400).json({ error: message });
        res.json({ message, user: { id: new_user_id, name, role: 'User' } });
    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    try {
        const rows = await callFunc('login_user_func($1, $2)', [email, password]);
        const { user_id, user_name, user_role, message } = rows[0];
        if (!user_id) return res.status(401).json({ error: message });

        // Fetch full profile
        const profileRows = await callFunc('get_user_profile_func($1)', [user_id]);
        const userProfile = profileRows[0];

        res.json({ message, user: { ...userProfile, role: user_role } });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const rows = await callFunc('login_admin_func($1, $2)', [email, password]);
        const { admin_id, admin_name, admin_role, message } = rows[0];
        if (!admin_id) return res.status(401).json({ error: message });
        res.json({ message, user: { id: admin_id, name: admin_name, role: admin_role } });
    } catch (err) {
        console.error('Admin login error:', err.message);
        res.status(500).json({ error: 'Admin login failed' });
    }
});

// ==========================================
// PRODUCTS ENDPOINTS
// ==========================================

// GET all products
app.get('/api/products', async (req, res) => {
    try {
        const rows = await callFunc('get_products_func()');
        res.json(rows);
    } catch (err) {
        console.error('Get products error:', err.message);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const rows = await callFunc('get_product_func($1)', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Product not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('Get product error:', err.message);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// POST create product
app.post('/api/products', async (req, res) => {
    const { name, description, brand, price, stock, image, category, merchantId } = req.body;
    try {
        const rows = await callFunc(
            'add_product_func($1, $2, $3, $4, $5, $6, $7, $8)',
            [name, description || null, brand || null, price, stock, image || null, category, merchantId || 1]
        );
        res.json({ id: rows[0].add_product_func, message: 'Product added successfully' });
    } catch (err) {
        console.error('Add product error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// PUT update product
app.put('/api/products/:id', async (req, res) => {
    const { name, description, brand, price, stock, image, category } = req.body;
    try {
        const result = await pool.query(
            'SELECT update_product_func($1, $2, $3, $4, $5, $6, $7, $8) AS message',
            [req.params.id, name || null, description || null, brand || null, price || null, stock || null, image || null, category || null]
        );
        res.json({ message: result.rows[0].message });
    } catch (err) {
        console.error('Update product error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT delete_product_func($1) AS message',
            [req.params.id]
        );
        res.json({ message: result.rows[0].message });
    } catch (err) {
        console.error('Delete product error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ORDERS ENDPOINTS
// ==========================================

// POST create order
app.post('/api/orders', async (req, res) => {
    const { userId, paymentPlan, items, paymentMethod } = req.body;
    if (!userId || !paymentPlan || !items || !items.length) {
        return res.status(400).json({ error: 'userId, paymentPlan, and items are required' });
    }
    try {
        const rows = await callFunc(
            'create_order_func($1, $2, $3::JSONB, $4)',
            [userId, paymentPlan, JSON.stringify(items), paymentMethod || 'Card']
        );
        const { order_id, message } = rows[0];
        if (!order_id) return res.status(400).json({ error: message });
        res.json({ orderId: order_id, message });
    } catch (err) {
        console.error('Create order error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET user orders
app.get('/api/orders', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    try {
        const rows = await callFunc('get_user_orders_func($1)', [userId]);
        res.json(rows);
    } catch (err) {
        console.error('Get orders error:', err.message);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// POST pay installment
app.post('/api/installments/:id/pay', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    try {
        const rows = await pool.query(
            'SELECT pay_installment_func($1, $2) AS message',
            [req.params.id, userId]
        );
        const message = rows.rows[0].message;
        if (message.includes('Unauthorized') || message.includes('already paid')) {
            return res.status(400).json({ error: message });
        }
        res.json({ message });
    } catch (err) {
        console.error('Pay installment error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// USER PROFILE ENDPOINTS
// ==========================================

// GET user profile
app.get('/api/users/:id/profile', async (req, res) => {
    try {
        const rows = await callFunc('get_user_profile_func($1)', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('Get profile error:', err.message);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT update user profile
app.put('/api/users/:id/profile', async (req, res) => {
    const { name, phone, address, city, zipCode } = req.body;
    try {
        const result = await pool.query(
            'SELECT update_user_profile_func($1, $2, $3, $4, $5, $6) AS message',
            [req.params.id, name || null, phone || null, address || null, city || null, zipCode || null]
        );
        res.json({ message: result.rows[0].message });
    } catch (err) {
        console.error('Update profile error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// NOTIFICATIONS ENDPOINTS
// ==========================================

// GET notifications
app.get('/api/users/:id/notifications', async (req, res) => {
    try {
        const rows = await callFunc('get_notifications_func($1)', [req.params.id]);
        res.json(rows);
    } catch (err) {
        console.error('Get notifications error:', err.message);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// PUT mark notification as read
app.put('/api/notifications/:id/read', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT mark_notification_read_func($1) AS message',
            [req.params.id]
        );
        res.json({ message: result.rows[0].message });
    } catch (err) {
        console.error('Mark notification error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

// GET admin stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        // Get each stats component separately to avoid type mismatch issues
        const statsResult = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM users)::INT AS total_users,
                (SELECT COUNT(*) FROM merchants)::INT AS total_merchants,
                (SELECT COUNT(*) FROM orders WHERE status != 'Cancelled')::INT AS total_orders,
                COALESCE((SELECT SUM(total_amount) FROM orders WHERE status != 'Cancelled'), 0) AS total_revenue,
                COALESCE((SELECT SUM(outstanding_balance) FROM orders), 0) AS total_outstanding,
                (SELECT COUNT(*) FROM installments WHERE status = 'Overdue')::INT AS overdue_installments,
                (SELECT COUNT(DISTINCT plan_id) FROM installments WHERE status = 'Pending')::INT AS active_plans
        `);
        const merchantRevenue = await callFunc('get_merchant_revenue_func()');
        const revenueByPlan = await callFunc('get_revenue_by_plan_func()');
        const monthlyRevenue = await callFunc('get_monthly_revenue_func()');
        res.json({ stats: statsResult.rows[0], merchantRevenue, revenueByPlan, monthlyRevenue });
    } catch (err) {
        console.error('Admin stats error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET all users (admin)
app.get('/api/admin/users', async (req, res) => {
    try {
        const rows = await callFunc('get_all_users_func()');
        res.json(rows);
    } catch (err) {
        console.error('Admin get users error:', err.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET all merchants (admin)
app.get('/api/admin/merchants', async (req, res) => {
    try {
        const rows = await callFunc('get_all_merchants_func()');
        res.json(rows);
    } catch (err) {
        console.error('Admin get merchants error:', err.message);
        res.status(500).json({ error: 'Failed to fetch merchants' });
    }
});

// POST verify merchant
app.post('/api/admin/merchants/:id/verify', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT verify_merchant_func($1) AS message', [req.params.id]
        );
        res.json({ message: result.rows[0].message });
    } catch (err) {
        console.error('Verify merchant error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST process merchant settlement
app.post('/api/admin/merchants/:id/settle', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT process_settlement_func($1) AS message', [req.params.id]
        );
        res.json({ message: result.rows[0].message });
    } catch (err) {
        console.error('Process settlement error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET audit logs (admin)
app.get('/api/admin/audit-logs', async (req, res) => {
    try {
        const rows = await callFunc('get_audit_logs_func()');
        res.json(rows);
    } catch (err) {
        console.error('Audit logs error:', err.message);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

// ==========================================
// SELLER ENDPOINTS
// ==========================================

// GET seller products
app.get('/api/seller/products', async (req, res) => {
    const { merchantId } = req.query;
    if (!merchantId) return res.status(400).json({ error: 'merchantId is required' });
    try {
        const rows = await callFunc('get_seller_products_func($1)', [merchantId]);
        res.json(rows);
    } catch (err) {
        console.error('Get seller products error:', err.message);
        res.status(500).json({ error: 'Failed to fetch seller products' });
    }
});

// ==========================================
// Server Start
// ==========================================
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Proyojon API running on http://localhost:${port}`);
});
