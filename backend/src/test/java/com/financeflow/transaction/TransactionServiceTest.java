
package com.financeflow.transaction;

import com.financeflow.user.User;
import com.financeflow.user.UserRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TransactionServiceTest {

    private TransactionRepository transactionRepository;
    private UserRepository userRepository;
    private TransactionService transactionService;

    @BeforeEach
    void setUp() {
        transactionRepository = mock(TransactionRepository.class);
        userRepository = mock(UserRepository.class);

        transactionService = new TransactionService(
            transactionRepository,
            userRepository
        );

        var principal =
            org.springframework.security.core.userdetails.User
                .withUsername("daniil@example.com")
                .password("unused")
                .roles("USER")
                .build();

        var authentication =
            new UsernamePasswordAuthenticationToken(
                principal,
                null,
                principal.getAuthorities()
            );

        var context =
            SecurityContextHolder.createEmptyContext();

        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldReturnOnlyCurrentUsersTransactions() {
        User user = mock(User.class);

        when(user.getId()).thenReturn(1L);

        when(userRepository.findByEmail(
            "daniil@example.com"
        )).thenReturn(Optional.of(user));

        when(transactionRepository
            .findByUser_IdOrderByTransactionDateDescIdDesc(1L))
            .thenReturn(List.of());

        List<TransactionResponse> result =
            transactionService.findAll();

        assertTrue(result.isEmpty());

        verify(transactionRepository)
            .findByUser_IdOrderByTransactionDateDescIdDesc(1L);

        verify(transactionRepository, never())
            .findAll();
    }

    @Test
    void shouldRejectTransactionNotOwnedByUser() {
        User user = mock(User.class);

        when(user.getId()).thenReturn(1L);

        when(userRepository.findByEmail(
            "daniil@example.com"
        )).thenReturn(Optional.of(user));

        when(transactionRepository.findByIdAndUser_Id(
            99L, 1L
        )).thenReturn(Optional.empty());

        ResponseStatusException exception =
            assertThrows(
                ResponseStatusException.class,
                () -> transactionService.findById(99L)
            );

        assertEquals(
            HttpStatus.NOT_FOUND,
            exception.getStatusCode()
        );

        verify(transactionRepository)
            .findByIdAndUser_Id(99L, 1L);

        verify(transactionRepository, never())
            .findById(99L);
    }

    @Test
    void shouldRejectUnauthenticatedUser() {
        SecurityContextHolder.clearContext();

        ResponseStatusException exception =
            assertThrows(
                ResponseStatusException.class,
                () -> transactionService.findAll()
            );

        assertEquals(
            HttpStatus.UNAUTHORIZED,
            exception.getStatusCode()
        );

        verifyNoInteractions(
            userRepository,
            transactionRepository
        );
    }

    @Test
    void shouldRejectDeletionOfAnotherUsersTransaction() {
        User user = mock(User.class);

        when(user.getId()).thenReturn(1L);

        when(userRepository.findByEmail(
            "daniil@example.com"
        )).thenReturn(Optional.of(user));

        when(transactionRepository.findByIdAndUser_Id(
            99L, 1L
        )).thenReturn(Optional.empty());

        ResponseStatusException exception =
            assertThrows(
                ResponseStatusException.class,
                () -> transactionService.delete(99L)
            );

        assertEquals(
            HttpStatus.NOT_FOUND,
            exception.getStatusCode()
        );

        verify(transactionRepository, never())
            .delete(any(Transaction.class));
    }
}
