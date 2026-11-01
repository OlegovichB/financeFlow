
package com.financeflow.transaction;

import com.financeflow.user.User;
import com.financeflow.user.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionService(
            TransactionRepository transactionRepository,
            UserRepository userRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    // Find the currently authenticated user
    private User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getPrincipal()
                    instanceof String) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authentication required"
            );
        }

        return userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found"
                    )
                );
    }

    // Create a new transaction
    @Transactional
    public TransactionResponse create(TransactionRequest request) {
        User user = getCurrentUser();

        Transaction transaction = new Transaction(
            user,
            request.type(),
            request.amount(),
            request.category().trim(),
            normalizeDescription(request.description()),
            request.transactionDate()
        );

        Transaction saved = transactionRepository.saveAndFlush(
            transaction
        );

        return TransactionResponse.from(saved);
    }

    // List transactions belonging to the current user
    @Transactional(readOnly = true)
    public List<TransactionResponse> findAll() {
        User user = getCurrentUser();

        return transactionRepository
                .findByUser_IdOrderByTransactionDateDescIdDesc(
                    user.getId()
                )
                .stream()
                .map(TransactionResponse::from)
                .toList();
    }

    // Find a single transaction owned by the current user
    @Transactional(readOnly = true)
    public TransactionResponse findById(Long id) {
        User user = getCurrentUser();

        Transaction transaction = transactionRepository
                .findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Transaction not found"
                    )
                );

        return TransactionResponse.from(transaction);
    }

    // Update an existing transaction
    @Transactional
    public TransactionResponse update(
            Long id,
            TransactionRequest request
    ) {
        User user = getCurrentUser();

        Transaction transaction = transactionRepository
                .findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Transaction not found"
                    )
                );

        transaction.setType(request.type());
        transaction.setAmount(request.amount());
        transaction.setCategory(request.category().trim());
        transaction.setDescription(
            normalizeDescription(request.description())
        );
        transaction.setTransactionDate(request.transactionDate());

        Transaction saved = transactionRepository.saveAndFlush(
            transaction
        );

        return TransactionResponse.from(saved);
    }

    // Delete a transaction owned by the current user
    @Transactional
    public void delete(Long id) {
        User user = getCurrentUser();

        Transaction transaction = transactionRepository
                .findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Transaction not found"
                    )
                );

        transactionRepository.delete(transaction);
    }

    private String normalizeDescription(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }

        return description.trim();
    }
}
