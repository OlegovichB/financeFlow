
package com.financeflow.budget;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository
        extends JpaRepository<Budget, Long> {

    List<Budget> findByUser_IdAndMonthOrderByCategoryAsc(
        Long userId,
        LocalDate month
    );

    Optional<Budget> findByIdAndUser_Id(
        Long budgetId,
        Long userId
    );

    boolean existsByUser_IdAndMonthAndCategoryIgnoreCase(
        Long userId,
        LocalDate month,
        String category
    );
}
