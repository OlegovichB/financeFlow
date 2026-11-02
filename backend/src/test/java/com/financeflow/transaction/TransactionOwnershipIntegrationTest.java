
package com.financeflow.transaction;

import com.financeflow.user.User;
import com.financeflow.user.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TransactionOwnershipIntegrationTest {

    private static final String API = "/api/v1/transactions";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    private User userA;
    private User userB;
    private Transaction transactionA;
    private Transaction transactionB;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString();

        userA = userRepository.saveAndFlush(
            new User(
                "Daniil",
                "daniil-" + suffix + "@example.com",
                "test-password-hash"
            )
        );

        userB = userRepository.saveAndFlush(
            new User(
                "Alex",
                "alex-" + suffix + "@example.com",
                "test-password-hash"
            )
        );

        transactionA = transactionRepository.saveAndFlush(
            new Transaction(
                userA,
                TransactionType.EXPENSE,
                new BigDecimal("85.00"),
                "Groceries",
                "Daniil shopping",
                LocalDate.of(2026, 11, 1)
            )
        );

        transactionB = transactionRepository.saveAndFlush(
            new Transaction(
                userB,
                TransactionType.EXPENSE,
                new BigDecimal("120.00"),
                "Transport",
                "Alex transport",
                LocalDate.of(2026, 11, 1)
            )
        );
    }

    @Test
    void userShouldOnlySeeOwnTransactions() throws Exception {
        mockMvc.perform(
                get(API)
                    .with(user(userA.getEmail()).roles("USER"))
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(
                transactionA.getId()
            ))
            .andExpect(jsonPath("$[1]").doesNotExist());
    }

    @Test
    void userCannotReadAnotherUsersTransaction() throws Exception {
        mockMvc.perform(
                get(API + "/" + transactionB.getId())
                    .with(user(userA.getEmail()).roles("USER"))
            )
            .andExpect(status().isNotFound());
    }

    @Test
    void userCannotUpdateAnotherUsersTransaction() throws Exception {
        String updateJson = """
            {
              "type": "EXPENSE",
              "amount": 999.00,
              "category": "Modified",
              "description": "Unauthorized update",
              "transactionDate": "2026-11-01"
            }
            """;

        mockMvc.perform(
                put(API + "/" + transactionB.getId())
                    .with(user(userA.getEmail()).roles("USER"))
                    .with(csrf().asHeader())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(updateJson)
            )
            .andExpect(status().isNotFound());

        Transaction unchanged = transactionRepository
            .findById(transactionB.getId())
            .orElseThrow();

        assertEquals(
            0,
            new BigDecimal("120.00").compareTo(unchanged.getAmount())
        );

        assertEquals("Transport", unchanged.getCategory());
    }

    @Test
    void userCannotDeleteAnotherUsersTransaction() throws Exception {
        mockMvc.perform(
                delete(API + "/" + transactionB.getId())
                    .with(user(userA.getEmail()).roles("USER"))
                    .with(csrf().asHeader())
            )
            .andExpect(status().isNotFound());

        assertTrue(
            transactionRepository.existsById(transactionB.getId())
        );
    }

    @Test
    void ownerCanReadOwnTransaction() throws Exception {
        mockMvc.perform(
                get(API + "/" + transactionB.getId())
                    .with(user(userB.getEmail()).roles("USER"))
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.category").value("Transport"))
            .andExpect(jsonPath("$.amount").value("120.00"));
    }
}
