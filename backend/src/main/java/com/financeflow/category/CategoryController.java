
package com.financeflow.category;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<CategoryResponse> findAll() {
        return categoryService.findAll();
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(
        @Valid @RequestBody CategoryRequest request
    ) {
        CategoryResponse created = categoryService.create(request);

        return ResponseEntity
            .created(URI.create("/api/v1/categories/" + created.id()))
            .body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable Long id
    ) {
        categoryService.delete(id);

        return ResponseEntity.noContent().build();
    }

}
