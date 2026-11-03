
package com.financeflow.budget;

import com.financeflow.user.User;

import jakarta.persistence.*;

import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(name = "budget_month", nullable = false)
    private LocalDate month;

    @Column(
        nullable = false,
        precision = 15,
        scale = 2
    )
    private BigDecimal amount;

    @Generated(event = EventType.INSERT)
    @Column(
        name = "created_at",
        nullable = false,
        insertable = false,
        updatable = false
    )
    private OffsetDateTime createdAt;

    protected Budget() {
    }

    public Budget(
        User user,
        String category,
        LocalDate month,
        BigDecimal amount
    ) {
        this.user = user;
        this.category = category;
        this.month = month;
        this.amount = amount;
    }

    public Long getId() {
        return id;
    }

    public String getCategory() {
        return category;
    }

    public LocalDate getMonth() {
        return month;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
