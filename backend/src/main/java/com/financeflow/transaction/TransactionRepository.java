
package com.financeflow.transaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUser_IdOrderByTransactionDateDescIdDesc(
        Long userId
    );

    Optional<Transaction> findByIdAndUser_Id(
        Long transactionId,
        Long userId
    );

    boolean existsByIdAndUser_Id(
        Long transactionId,
        Long userId
    );
}
