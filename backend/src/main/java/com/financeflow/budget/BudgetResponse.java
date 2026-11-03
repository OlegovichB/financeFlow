
package com.financeflow.budget;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record BudgetResponse(
    Long id,
    String category,
    LocalDate month,

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    BigDecimal amount,

    OffsetDateTime createdAt
) {
    public static BudgetResponse from(Budget budget) {
        return new BudgetResponse(
            budget.getId(),
            budget.getCategory(),
            budget.getMonth(),
            budget.getAmount(),
            budget.getCreatedAt()
        );
    }
}
