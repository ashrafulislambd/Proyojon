# Proyojon - RDBMS Project

**Group:** CodeHive  
**DBMS:** PostgreSQL

## Project Overview
Proyojon is a "Buy Now Pay Later" (BNPL) system for day-to-day items (FMCG, Medicine). It features a robust PostgreSQL backend with advanced PL/SQL implementations including stored procedures, triggers, and analytical queries.

## How to Run (Database Setup)

You need **PostgreSQL** installed.

1.  **Create Database**:
    ```bash
    createdb proyojon_db
    ```

2.  **Execute SQL Scripts** (in order):
    Navigate to the `sql/` directory and run:

    ```bash
    # 1. Create Tables
    psql -d proyojon_db -f schema.sql

    # 2. Apply Constraints & Indexes
    psql -d proyojon_db -f constraints.sql

    # 3. Seed Sample Data
    psql -d proyojon_db -f seed.sql

    # 4. Create Functions & Procedures
    psql -d proyojon_db -f functions.sql
    psql -d proyojon_db -f procedures.sql

    # 5. Create Triggers
    psql -d proyojon_db -f triggers.sql

    # 6. Create Views & Queries
    psql -d proyojon_db -f views.sql
    # (Optional) Run query library to see results
    psql -d proyojon_db -f queries.sql
    ```

## Features Implemented
- **Schema**: 15 Tables (3NF) including `users`, `merchants`, `orders`, `transactions`, `installments`.
- **Advanced SQL**: CUBE, ROLLUP, Window Functions, CTEs using `sql/queries.sql`.
- **Procedural Logic**:
    - **Procedures**: `process_order_proc` (Transactional), `generate_installments_proc`.
    - **Functions**: `calculate_credit_score_func` (Dynamic scoring).
    - **Triggers**: `trg_audit_users` (JSON Audit log), `trg_enforce_credit_limit`.
- **Security**: Role-Based Access Control (RBAC) tables and Audit logging.

## Documentation
- [ER Diagram](docs/erd.md)
- [Project Report](docs/project_report.md)