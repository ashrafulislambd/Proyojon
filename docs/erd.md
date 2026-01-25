# Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    USERS ||--o{ PRESCRIPTIONS : uploads
    USERS ||--o{ RATINGS : gives
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ CREDIT_SCORES : has

    MERCHANTS ||--o{ PRODUCTS : sells
    MERCHANTS ||--o{ ORDERS : receives
    
    PRODUCT_CATEGORIES ||--o{ PRODUCTS : categorizes
    
    ORDERS ||--o{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : listed_in
    
    ORDERS ||--o{ TRANSACTIONS : initiates
    
    TRANSACTIONS ||--o{ INSTALLMENT_PLANS : has
    INSTALLMENT_PLANS ||--o{ INSTALLMENTS : consists_of

    ROLES ||--o{ ADMINS : assigned_to

    USERS {
        int id PK
        string name
        string email
        string phone
        string nid_info
        float credit_limit
    }

    MERCHANTS {
        int id PK
        string name
        string type
    }

    PRODUCTS {
        int id PK
        int merchant_id FK
        string name
        float price
        int stock
    }

    ORDERS {
        int id PK
        int user_id FK
        float total_amount
        string status
    }

    TRANSACTIONS {
        int id PK
        int order_id FK
        float amount
        string status
    }

    INSTALLMENT_PLANS {
        int id PK
        int transaction_id FK
        int total_installments
    }
```

## Schema Description
The schema is normalized to 3NF.
- **Users**: Central entity.
- **Merchants**: Aggregates Pharmacies and other vendors.
- **Orders & Transactions**: Separated to allow complex payment flows (like installments).
- **Audit Logs**: (Not shown in ERD relationally) Tracks all changes.
