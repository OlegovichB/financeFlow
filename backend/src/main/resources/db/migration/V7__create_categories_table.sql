
CREATE TABLE categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id BIGINT NOT NULL,

    name VARCHAR(100) NOT NULL,

    type VARCHAR(10) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_categories_type
        CHECK (type IN ('INCOME', 'EXPENSE')),

    CONSTRAINT chk_categories_name
        CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE UNIQUE INDEX uq_categories_user_type_name
ON categories (user_id, type, LOWER(name));

CREATE INDEX idx_categories_user
ON categories (user_id);
