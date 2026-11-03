package com.financeflow.transaction;

import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import com.financeflow.auth.CustomUserDetailsService;
import com.financeflow.config.SecurityConfig;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransactionController.class)
@Import(SecurityConfig.class)
@EnableWebSecurity
class TransactionControllerTest {

    private static final String API = "/api/v1/transactions";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TransactionService transactionService;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    private static final String VALID_JSON = """
        {
          "type": "EXPENSE",
          "amount": 10,
          "category": "Groceries",
          "description": "Weekly shopping",
          "transactionDate": "2026-11-01"
        }
        """;

    private TransactionResponse sampleResponse() {
        return new TransactionResponse(
            1L,
            TransactionType.EXPENSE,
            new BigDecimal("10"),
            "Groceries",
            "Weekly shopping",
            LocalDate.of(2026, 11, 1),
            null,
            null
        );
    }

    @Test
    void shouldRejectUnauthenticatedRequest() throws Exception {
        mockMvc.perform(get(API))
            .andExpect(status().isUnauthorized());

        verifyNoInteractions(transactionService);
    }

    @Test
    void shouldAllowAuthenticatedUserToListTransactions()
            throws Exception {

        when(transactionService.findAll())
            .thenReturn(java.util.List.of());

        mockMvc.perform(
                get(API)
                    .with(user("daniil@example.com"))
            )
            .andExpect(status().isOk())
            .andExpect(content().json("[]"));

        verify(transactionService).findAll();
    }

    @Test
    void shouldRejectPostWithoutCsrf() throws Exception {
        mockMvc.perform(
                post(API)
                    .with(user("daniil@example.com"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(VALID_JSON)
            )
            .andExpect(status().isForbidden());

        verifyNoInteractions(transactionService);
    }

    @Test
    void shouldRejectNegativeAmount() throws Exception {
        String invalidJson = """
            {
              "type": "EXPENSE",
              "amount": -50.00,
              "category": "Groceries",
              "transactionDate": "2026-11-01"
            }
            """;

        mockMvc.perform(
                post(API)
                    .with(user("daniil@example.com"))
                    .with(csrf().asHeader())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidJson)
            )
            .andExpect(status().isBadRequest());

        verifyNoInteractions(transactionService);
    }

    @Test
    void shouldCreateTransaction() throws Exception {
        when(transactionService.create(any(TransactionRequest.class)))
            .thenReturn(sampleResponse());

        mockMvc.perform(
                post(API)
                    .with(user("daniil@example.com"))
                    .with(csrf().asHeader())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(VALID_JSON)
            )
            .andExpect(status().isCreated())
            .andExpect(header().string(
                "Location", "/api/v1/transactions/1"
            ))
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.type").value("EXPENSE"))
            .andExpect(jsonPath("$.category").value("Groceries"))
            .andExpect(jsonPath("$.amount").value("10"));

        verify(transactionService).create(
            any(TransactionRequest.class)
        );
    }

    @Test
    void shouldUpdateTransaction() throws Exception {
        when(transactionService.update(
                eq(1L),
                any(TransactionRequest.class)
        )).thenReturn(sampleResponse());

        mockMvc.perform(
                put(API + "/1")
                    .with(user("daniil@example.com"))
                    .with(csrf().asHeader())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(VALID_JSON)
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1));

        verify(transactionService).update(
            eq(1L),
            any(TransactionRequest.class)
        );
    }

    @Test
    void shouldDeleteTransaction() throws Exception {
        mockMvc.perform(
                delete(API + "/1")
                    .with(user("daniil@example.com"))
                    .with(csrf().asHeader())
            )
            .andExpect(status().isNoContent());

        verify(transactionService).delete(1L);
    }


    @Test
    void shouldReturnStructuredValidationError() throws Exception {
        String invalidJson = """
            {
            "type": "EXPENSE",
            "amount": -50.00,
            "category": "Groceries",
            "transactionDate": "2026-11-02"
            }
            """;

        mockMvc.perform(
                post(API)
                    .with(user("daniil@example.com"))
                    .with(csrf().asHeader())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidJson)
            )
            .andExpect(status().isBadRequest())
            .andExpect(
                jsonPath("$.code").value("VALIDATION_ERROR")
            )
            .andExpect(
                jsonPath("$.message")
                    .value("Please check the submitted fields")
            )
            .andExpect(
                jsonPath("$.fieldErrors.amount")
                    .value("Amount must be greater than zero")
            );
    }

    @Test
    void shouldReturnStructuredInvalidJsonError() throws Exception {
        String invalidJson = """
            {
            "type": "INVALID_TYPE",
            "amount": 50.00,
            "category": "Groceries",
            "transactionDate": "2026-11-02"
            }
            """;

        mockMvc.perform(
                post(API)
                    .with(user("daniil@example.com"))
                    .with(csrf().asHeader())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidJson)
            )
            .andExpect(status().isBadRequest())
            .andExpect(
                jsonPath("$.code").value("INVALID_REQUEST_BODY")
            )
            .andExpect(
                jsonPath("$.message")
                    .value("Invalid request body or field format")
            );
    }

}
