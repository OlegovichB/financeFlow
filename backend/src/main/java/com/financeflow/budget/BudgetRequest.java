
package com.financeflow.budget;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BudgetRequest(

    @NotBlank(message = "Category is required")
    @Size(
        max = 100,
        message = "Category must be at most 100 characters"
    )
    String category,

    @NotNull(message = "Month is required")
    LocalDate month,

    @NotNull(message = "Budget amount is required")
    @DecimalMin(
        value = "0.01",
        message = "Budget amount must be greater than zero"
    )
    @Digits(integer = 13, fraction = 2)
    BigDecimal amount

) {
}
