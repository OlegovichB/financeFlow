CREATE TABLE app_metadata (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_name VARCHAR(100) NOT NULL,
    schema_version INTEGER NOT NULL
);

INSERT INTO app_metadata (
    application_name,
    schema_version
)
VALUES (
    'FinanceFlow',
    1
);
