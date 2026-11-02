
package com.financeflow.transaction;

import com.financeflow.user.User;
import com.financeflow.user.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class TransactionTimestampIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // Test 1: Verify that the PostgreSQL trigger updates updated_at.
    @Test
    void shouldUpdateTimestampWhenTransactionChanges() {

        String email = "timestamp-" +
            UUID.randomUUID() + "@example.com";

        User user = userRepository.saveAndFlush(
            new User(
                "Timestamp Test",
                email,
                "test-password-hash"
            )
        );

        Long transactionId = jdbcTemplate.queryForObject(
            """
            INSERT INTO transactions (
                user_id,
                type,
                amount,
                category,
                transaction_date,
                created_at,
                updated_at
            )
            VALUES (
                ?, 'EXPENSE', 85.50, 'Groceries',
                CURRENT_DATE,
                TIMESTAMPTZ '2020-01-01 00:00:00+00',
                TIMESTAMPTZ '2020-01-01 00:00:00+00'
            )
            RETURNING id
            """,
            Long.class,
            user.getId()
        );

        // Update the transaction amount.
        jdbcTemplate.update(
            "UPDATE transactions SET amount = ? WHERE id = ?",
            95.00,
            transactionId
        );

        Boolean updatedAtChanged = jdbcTemplate.queryForObject(
            """
            SELECT updated_at > TIMESTAMPTZ '2020-01-01 00:00:00+00'
            FROM transactions
            WHERE id = ?
            """,
            Boolean.class,
            transactionId
        );

        Boolean createdAtUnchanged = jdbcTemplate.queryForObject(
            """
            SELECT created_at = TIMESTAMPTZ '2020-01-01 00:00:00+00'
            FROM transactions
            WHERE id = ?
            """,
            Boolean.class,
            transactionId
        );

        assertEquals(Boolean.TRUE, updatedAtChanged);
        assertEquals(Boolean.TRUE, createdAtUnchanged);
    }

    // Test 2: Verify that Hibernate receives the updated timestamp.
    @Test
    void shouldSynchronizeUpdatedAtWithHibernate() {

        User user = userRepository.saveAndFlush(
            new User(
                "Hibernate Test",
                "hibernate-" + UUID.randomUUID() + "@example.com",
                "test-password-hash"
            )
        );

        Transaction transaction = new Transaction(
            user,
            TransactionType.EXPENSE,
            new BigDecimal("85.50"),
            "Groceries",
            "Original amount",
            LocalDate.of(2026, 11, 1)
        );

        transactionRepository.saveAndFlush(transaction);

        // Check that timestamps are populated after INSERT.
        assertNotNull(transaction.getCreatedAt());
        assertNotNull(transaction.getUpdatedAt());

        // Update the transaction amount.
        transaction.setAmount(new BigDecimal("95.00"));

        transactionRepository.saveAndFlush(transaction);

        // Read the actual timestamp from PostgreSQL.
        OffsetDateTime databaseUpdatedAt =
            jdbcTemplate.queryForObject(
                """
                SELECT updated_at
                FROM transactions
                WHERE id = ?
                """,
                OffsetDateTime.class,
                transaction.getId()
            );

        assertNotNull(databaseUpdatedAt);
        assertNotNull(transaction.getUpdatedAt());

        // Hibernate and PostgreSQL must contain the same timestamp.
        assertEquals(
            databaseUpdatedAt.toInstant(),
            transaction.getUpdatedAt().toInstant()
        );

        // Verify that the transaction amount was updated.
        assertEquals(
            0,
            new BigDecimal("95.00").compareTo(
                transaction.getAmount()
            )
        );
    }
}
