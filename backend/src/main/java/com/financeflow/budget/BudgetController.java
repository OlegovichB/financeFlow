
package com.financeflow.budget;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public List<BudgetResponse> findByMonth(
        @RequestParam LocalDate month
    ) {
        return budgetService.findByMonth(month);
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> create(
        @Valid @RequestBody BudgetRequest request
    ) {
        BudgetResponse created = budgetService.create(request);

        return ResponseEntity
            .created(
                URI.create("/api/v1/budgets/" + created.id())
            )
            .body(created);
    }

    @PutMapping("/{id}")
    public BudgetResponse update(
        @PathVariable Long id,
        @Valid @RequestBody BudgetRequest request
    ) {
        return budgetService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable Long id
    ) {
        budgetService.delete(id);

        return ResponseEntity.noContent().build();
    }
}
