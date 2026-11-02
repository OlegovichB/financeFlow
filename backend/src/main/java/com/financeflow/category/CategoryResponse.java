
package com.financeflow.category;

import java.time.OffsetDateTime;

import com.financeflow.transaction.TransactionType;

public record CategoryResponse(
    Long id,
    String name,
    TransactionType type,
    OffsetDateTime createdAt
) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
            category.getId(),
            category.getName(),
            category.getType(),
            category.getCreatedAt()
        );
    }
}
