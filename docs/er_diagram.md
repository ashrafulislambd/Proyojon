# Proyojon - ER Diagram

This document contains the Entity-Relationship (ER) diagram for the **Proyojon** system, representing the current database schema.

## 1. ER Diagram (Mermaid)

```mermaid
erDiagram
    ROLES ||--o{ ADMINS : "has"
    USERS ||--o{ PRESCRIPTIONS : "uploads"
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ CREDIT_SCORES : "has history"
    USERS ||--o{ NOTIFICATIONS : "receives"
    MERCHANTS ||--o{ PRODUCTS : "sells"
    MERCHANTS ||--o{ ORDERS : "receives"
    PRODUCT_CATEGORIES ||--o{ PRODUCTS : "classifies"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "listed in"
    ORDERS ||--|| TRANSACTIONS : "generates"
    TRANSACTIONS ||--|| INSTALLMENT_PLANS : "creates"
    INSTALLMENT_PLANS ||--o{ INSTALLMENTS : "consists of"

    ROLES {
        int id PK
        varchar name
        text description
    }

    ADMINS {
        int id PK
        varchar name
        varchar email
        varchar password_hash
        int role_id FK
        timestamp created_at
    }

    USERS {
        int id PK
        varchar name
        varchar email
        varchar phone
        varchar nid_info
        text address
        varchar selfie_url
        decimal credit_limit
        varchar password_hash
        timestamp created_at
    }

    MERCHANTS {
        int id PK
        varchar name
        varchar type
        varchar contact_email
        varchar contact_phone
        text address
        timestamp created_at
    }

    PRODUCT_CATEGORIES {
        int id PK
        varchar name
        text description
    }

    PRODUCTS {
        int id PK
        int merchant_id FK
        int category_id FK
        varchar name
        text description
        decimal price
        int stock_quantity
        timestamp created_at
    }

    PRESCRIPTIONS {
        int id PK
        int user_id FK
        text details
        varchar image_url
        varchar status
        timestamp uploaded_at
    }

    ORDERS {
        int id PK
        int user_id FK
        int merchant_id FK
        decimal total_amount
        varchar status
        timestamp created_at
    }

    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
    }

    TRANSACTIONS {
        int id PK
        int order_id FK
        timestamp transaction_date
        decimal amount
        varchar payment_method
        varchar status
    }

    INSTALLMENT_PLANS {
        int id PK
        int transaction_id FK
        int total_installments
        decimal interest_rate
        timestamp created_at
    }

    INSTALLMENTS {
        int id PK
        int plan_id FK
        date due_date
        decimal amount
        varchar status
        timestamp paid_at
    }

    CREDIT_SCORES {
        int id PK
        int user_id FK
        int score
        timestamp calculated_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        varchar type
        text message
        boolean is_read
        timestamp sent_at
    }

    AUDIT_LOGS {
        int id PK
        varchar table_name
        varchar action
        int record_id
        jsonb old_data
        jsonb new_data
        varchar changed_by
        timestamp changed_at
    }
```

## 2. Key Entity Relationships

- **Users & Orders**: A one-to-many relationship where one user can place multiple orders.
- **Merchants & Products**: A one-to-many relationship where one merchant can list multiple products for sale.
- **Orders & Transactions**: Each order generates one transaction.
- **Transactions & Installment Plans**: A transaction can lead to one installment plan (if chosen as the payment method).
- **Installment Plans & Installments**: One plan is broken down into multiple monthly installments.
- **Auditing**: The `AUDIT_LOGS` table tracks changes across all major tables but does not have direct foreign key constraints to allow for record deletion persistence.
