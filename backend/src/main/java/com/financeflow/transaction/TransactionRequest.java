
package com.financeflow.transaction;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(

    @NotNull(message = "Transaction type is required")
    TransactionType type,

    @NotNull(message = "Amount is required")
    @DecimalMin(
        value = "0.01",
        message = "Amount must be greater than zero"
    )
    @Digits(
        integer = 13,
        fraction = 2,
        message = "Invalid amount format"
    )
    BigDecimal amount,

    @NotBlank(message = "Category is required")
    @Size(max = 100)
    String category,

    @Size(max = 255)
    String description,

    @NotNull(message = "Transaction date is required")
    LocalDate transactionDate

) {}
