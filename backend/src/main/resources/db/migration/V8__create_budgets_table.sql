
CREATE TABLE budgets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id BIGINT NOT NULL,

    category VARCHAR(100) NOT NULL,

    budget_month DATE NOT NULL,

    amount NUMERIC(15, 2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_budgets_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_budgets_category
        CHECK (LENGTH(TRIM(category)) > 0),

    CONSTRAINT chk_budgets_amount
        CHECK (amount > 0),

    CONSTRAINT chk_budgets_month
        CHECK (EXTRACT(DAY FROM budget_month) = 1)
);

CREATE UNIQUE INDEX uq_budgets_user_month_category
ON budgets (
    user_id,
    budget_month,
    LOWER(category)
);

CREATE INDEX idx_budgets_user_month
ON budgets (user_id, budget_month);
