
package com.financeflow.budget;

import com.financeflow.user.User;
import com.financeflow.user.UserRepository;

import org.springframework.http.HttpStatus;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    public BudgetService(
        BudgetRepository budgetRepository,
        UserRepository userRepository
    ) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication =
            SecurityContextHolder.getContext()
                .getAuthentication();

        if (
            authentication == null ||
            !authentication.isAuthenticated() ||
            "anonymousUser".equals(authentication.getPrincipal())
        ) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authentication required"
            );
        }

        return userRepository
            .findByEmail(authentication.getName())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "User not found"
            ));
    }

    private void validateMonth(LocalDate month) {
        if (month.getDayOfMonth() != 1) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Month must be the first day of a month"
            );
        }
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> findByMonth(LocalDate month) {
        validateMonth(month);

        User user = getCurrentUser();

        return budgetRepository
            .findByUser_IdAndMonthOrderByCategoryAsc(
                user.getId(),
                month
            )
            .stream()
            .map(BudgetResponse::from)
            .toList();
    }

    @Transactional
    public BudgetResponse create(BudgetRequest request) {
        validateMonth(request.month());

        User user = getCurrentUser();

        String category = request.category().trim();

        boolean exists = budgetRepository
            .existsByUser_IdAndMonthAndCategoryIgnoreCase(
                user.getId(),
                request.month(),
                category
            );

        if (exists) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Budget for this category and month already exists"
            );
        }

        Budget budget = new Budget(
            user,
            category,
            request.month(),
            request.amount()
        );

        Budget saved = budgetRepository.saveAndFlush(budget);

        return BudgetResponse.from(saved);
    }

    @Transactional
    public BudgetResponse update(
        Long budgetId,
        BudgetRequest request
    ) {
        validateMonth(request.month());

        User user = getCurrentUser();

        Budget budget = budgetRepository
            .findByIdAndUser_Id(budgetId, user.getId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Budget not found"
            ));

        // This endpoint changes only the amount.
        // A budget's category and month are immutable.
        if (
            !budget.getMonth().equals(request.month()) ||
            !budget.getCategory().equals(request.category().trim())
        ) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Budget category and month cannot be changed"
            );
        }

        budget.setAmount(request.amount());

        Budget saved = budgetRepository.saveAndFlush(budget);

        return BudgetResponse.from(saved);
    }

    @Transactional
    public void delete(Long budgetId) {
        User user = getCurrentUser();

        Budget budget = budgetRepository
            .findByIdAndUser_Id(budgetId, user.getId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Budget not found"
            ));

        budgetRepository.delete(budget);
    }
}
