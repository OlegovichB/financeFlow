
package com.financeflow.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public record TransactionResponse(
    Long id,
    TransactionType type,
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    BigDecimal amount,
    String category,
    String description,
    LocalDate transactionDate,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
    public static TransactionResponse from(Transaction transaction) {
        return new TransactionResponse(
            transaction.getId(),
            transaction.getType(),
            transaction.getAmount(),
            transaction.getCategory(),
            transaction.getDescription(),
            transaction.getTransactionDate(),
            transaction.getCreatedAt(),
            transaction.getUpdatedAt()
        );
    }
}
