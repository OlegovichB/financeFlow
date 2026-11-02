
package com.financeflow.category;

import com.financeflow.user.User;
import com.financeflow.user.UserRepository;

import com.financeflow.transaction.TransactionType;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategoryService(
        CategoryRepository categoryRepository,
        UserRepository userRepository
    ) {
        this.categoryRepository = categoryRepository;
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

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        User user = getCurrentUser();

        return categoryRepository
            .findByUser_IdOrderByNameAsc(user.getId())
            .stream()
            .map(CategoryResponse::from)
            .toList();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        User user = getCurrentUser();

        String name = request.name().trim();
        TransactionType type = request.type();

        if (categoryRepository
            .existsByUser_IdAndTypeAndNameIgnoreCase(
                user.getId(),
                type,
                name
            )) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Category already exists"
            );
        }

        Category category = new Category(
            user,
            name,
            type
        );

        Category saved = categoryRepository
            .saveAndFlush(category);

        return CategoryResponse.from(saved);
    }
}
