
-- Get full order details for a specific user
SELECT 
    o.id AS order_id,
    o.created_at,
    m.name AS merchant_name,
    p.name AS product_name,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) AS subtotal
FROM orders o
JOIN merchants m ON o.merchant_id = m.id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.user_id = 1;

-- Aggregation & Grouping: Total sales per Merchant
SELECT 
    m.name AS merchant_name,
    COUNT(o.id) AS total_orders,
    SUM(o.total_amount) AS total_revenue
FROM merchants m
JOIN orders o ON m.id = o.merchant_id
WHERE o.status = 'Delivered'
GROUP BY m.name
ORDER BY total_revenue DESC;

-- Sales Report by Category and Product
SELECT 
    c.name AS category_name,
    p.name AS product_name,
    SUM(oi.quantity) AS total_sold,
    SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM product_categories c
JOIN products p ON c.id = p.category_id
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.status != 'Cancelled'
GROUP BY ROLLUP(c.name, p.name);

-- Find Users who spent more than average
SELECT id, name, email 
FROM users 
WHERE id IN (
    SELECT user_id 
    FROM orders 
    GROUP BY user_id 
    HAVING SUM(total_amount) > (
        SELECT AVG(user_total) 
        FROM (SELECT user_id, SUM(total_amount) as user_total FROM orders GROUP BY user_id) as sub
    )
);


-- Analyze Revenue by Year, Month, and Merchant Type
SELECT 
    EXTRACT(YEAR FROM o.created_at) AS year,
    EXTRACT(MONTH FROM o.created_at) AS month,
    m.type AS merchant_type,
    SUM(o.total_amount) AS revenue
FROM orders o
JOIN merchants m ON o.merchant_id = m.id
GROUP BY CUBE (year, month, merchant_type);

-- Rank Products by Price within Category
SELECT 
    p.name,
    c.name AS category,
    p.price,
    RANK() OVER (PARTITION BY c.id ORDER BY p.price DESC) as price_rank
FROM products p
JOIN product_categories c ON p.category_id = c.id;

-- Users with Overdue Installments
WITH OverdueUsers AS (
    SELECT DISTINCT u.id, u.name, u.phone
    FROM users u
    JOIN installment_plans ip ON u.id = (SELECT user_id FROM transactions t WHERE t.id = ip.transaction_id LIMIT 1) -- Indirect link via transaction>order>user (requires join fix below)
    JOIN installments i ON ip.id = i.plan_id
    WHERE i.status = 'Overdue'
)
SELECT * FROM OverdueUsers;

SELECT DISTINCT u.name, u.phone, i.due_date, i.amount
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN transactions t ON o.id = t.order_id
JOIN installment_plans ip ON t.id = ip.transaction_id
JOIN installments i ON ip.id = i.plan_id
WHERE i.status = 'Overdue';

-- Monthly Growth Rate of Revenue
SELECT 
    DATE_TRUNC('month', created_at) AS sales_month,
    SUM(total_amount) AS current_sales,
    LAG(SUM(total_amount)) OVER (ORDER BY DATE_TRUNC('month', created_at)) AS previous_sales,
    (SUM(total_amount) - LAG(SUM(total_amount)) OVER (ORDER BY DATE_TRUNC('month', created_at))) / NULLIF(LAG(SUM(total_amount)) OVER (ORDER BY DATE_TRUNC('month', created_at)), 0) * 100 AS growth_rate
FROM orders
WHERE status = 'Delivered'
GROUP BY 1;

-- Find Products that have never been sold
SELECT name, stock_quantity 
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.product_id = p.id
);

-- Pending Pharmacy Prescriptions older than 24 hours
SELECT u.name, p.details, p.uploaded_at
FROM prescriptions p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'Pending' 
AND p.uploaded_at < NOW() - INTERVAL '24 hours';

-- Grouping Sets: Revenue by Payment Method and Status
SELECT 
    payment_method,
    status,
    SUM(amount) as total_collected
FROM transactions
GROUP BY GROUPING SETS ((payment_method, status), (payment_method), ());
