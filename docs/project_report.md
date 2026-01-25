# Proyojon - Project Report

## 1. System Description
**Proyojon** is a Buy Now Pay Later (BNPL) system designed for day-to-day items like groceries and medicine. Unlike existing high-value electronics financing, Proyojon targets FMCG. The system allows users to purchase items from various merchants (Pharmacies, Groceries) and pay in installments. It features a robust credit scoring engine, automated stock management, and strict audit trails.

## 2. Database Design
The database is built on **PostgreSQL**.
- **Normalization**: All tables are in 3NF. Multi-valued attributes like `order_items` are separated.
- **Constraints**: 
  - `CHECK` constraints ensure positive values for prices and stock.
  - `FOREIGN KEY` constraints maintain referential integrity (e.g., deleting a User deletes their data if desired, or prevents it).
  - `INDEXing`: B-Tree indexes on `user_id`, `merchant_id`, and `status` columns optimize join performance and filtering.

## 3. Key SQL Components

### Advanced Queries
We implemented complex reporting queries using:
- **CUBE/ROLLUP**: For multi-dimensional sales analysis.
- **Window Functions**: To calculate month-over-month growth rates.
- **CTEs**: To isolate logic for overdue user finding.

### Procedural Logic
- **Functions**: `calculate_credit_score_func` dynamically computes user reliability based on payment history.
- **Procedures**: `process_order_proc` encapsulates 'Buy' logic in a single ACID transaction, ensuring stock is only deducted if payment init succeeds.
- **Triggers**: 
  - `trg_audit_users`: Automatically logs all changes to sensitive user data to a JSON-backed `audit_logs` table.
  - `trg_enforce_credit_limit`: Stops orders before insertion if the user exceeds their limit.

### 4. Application Demo
We implemented a **Full Stack Application** to demonstrate the database capabilities:
- **Backend (Node.js)**: Acts as a thin wrapper, calling PostgreSQL stored procedures for all business logic (e.g., `CALL process_order_proc(...)`).
- **Frontend (React)**: a User Interface for:
  - **Shop**: Listing products using `SELECT` queries.
  - **Dashboard**: Visualizing user credit health from Views.
  - **Admin**: Monitoring merchant performance via Analytical queries.

## 5. Team Contributions
- **Zannatul Ferdous Maliha**: User & Transaction schema, Credit Score function.
- **Abrar Shahriar**: Merchant & Product schema, Sales analytics queries.
- **Mahdeen Mannaf**: Prescription & Notification schema, Triggers.
- **Md. Ashraful Islam**: Pharmacy & Installment logic, Procedures, Integration.
