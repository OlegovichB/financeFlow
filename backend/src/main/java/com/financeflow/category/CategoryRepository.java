
package com.financeflow.category;

import com.financeflow.transaction.TransactionType;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository
        extends JpaRepository<Category, Long> {

    List<Category> findByUser_IdOrderByNameAsc(
        Long userId
    );

    boolean existsByUser_IdAndTypeAndNameIgnoreCase(
        Long userId,
        TransactionType type,
        String name
    );
}
