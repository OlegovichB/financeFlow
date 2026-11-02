
package com.financeflow.category;

import com.financeflow.transaction.TransactionType;
import com.financeflow.user.User;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 10)
    private TransactionType type;

    @Column(
        name = "created_at",
        nullable = false,
        insertable = false,
        updatable = false
    )
    private OffsetDateTime createdAt;

    protected Category() {
    }

    public Category(
        User user,
        String name,
        TransactionType type
    ) {
        this.user = user;
        this.name = name;
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getName() {
        return name;
    }

    public TransactionType getType() {
        return type;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
