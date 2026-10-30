
CREATE TABLE transactions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id BIGINT NOT NULL,

    type VARCHAR(10) NOT NULL,

    amount NUMERIC(15, 2) NOT NULL,

    category VARCHAR(100) NOT NULL,

    description VARCHAR(255),

    transaction_date DATE NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_transactions_type
        CHECK (type IN ('INCOME', 'EXPENSE')),

    CONSTRAINT chk_transactions_amount
        CHECK (amount > 0),

    CONSTRAINT chk_transactions_category
        CHECK (LENGTH(TRIM(category)) > 0)
);

CREATE INDEX idx_transactions_user_date
    ON transactions (user_id, transaction_date DESC);
