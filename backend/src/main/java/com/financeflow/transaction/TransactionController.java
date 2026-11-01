
package com.financeflow.transaction;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(
            TransactionService transactionService
    ) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(
            @Valid @RequestBody TransactionRequest request
    ) {
        TransactionResponse response =
                transactionService.create(request);

        URI location = URI.create(
            "/api/v1/transactions/" + response.id()
        );

        return ResponseEntity
                .created(location)
                .body(response);
    }

    @GetMapping
    public List<TransactionResponse> findAll() {
        return transactionService.findAll();
    }

    @GetMapping("/{id}")
    public TransactionResponse findById(
            @PathVariable Long id
    ) {
        return transactionService.findById(id);
    }

    @PutMapping("/{id}")
    public TransactionResponse update(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request
    ) {
        return transactionService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        transactionService.delete(id);

        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }
}
