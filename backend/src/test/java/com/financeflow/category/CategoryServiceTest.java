
package com.financeflow.category;

import com.financeflow.transaction.TransactionType;
import com.financeflow.user.User;
import com.financeflow.user.UserRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CategoryService categoryService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User(
            "Test User",
            "test@example.com",
            "hashed-password"
        );

        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(
                "test@example.com",
                null,
                List.of()
            )
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldRejectUnauthenticatedRequests() {
        SecurityContextHolder.clearContext();

        ResponseStatusException exception =
            assertThrows(
                ResponseStatusException.class,
                () -> categoryService.findAll()
            );

        assertEquals(
            HttpStatus.UNAUTHORIZED,
            exception.getStatusCode()
        );

        verifyNoInteractions(categoryRepository);
    }

    @Test
    void shouldReturnOnlyCurrentUsersCategories() {
        when(userRepository.findByEmail("test@example.com"))
            .thenReturn(Optional.of(user));

        when(categoryRepository.findByUser_IdOrderByNameAsc(
            user.getId()
        )).thenReturn(List.of());

        List<CategoryResponse> result =
            categoryService.findAll();

        assertTrue(result.isEmpty());

        verify(categoryRepository)
            .findByUser_IdOrderByNameAsc(user.getId());
    }

    @Test
    void shouldRejectDuplicateCategory() {
        when(userRepository.findByEmail("test@example.com"))
            .thenReturn(Optional.of(user));

        when(
            categoryRepository
                .existsByUser_IdAndTypeAndNameIgnoreCase(
                    user.getId(),
                    TransactionType.EXPENSE,
                    "Gym"
                )
        ).thenReturn(true);

        CategoryRequest request = new CategoryRequest(
            "  Gym  ",
            TransactionType.EXPENSE
        );

        ResponseStatusException exception =
            assertThrows(
                ResponseStatusException.class,
                () -> categoryService.create(request)
            );

        assertEquals(
            HttpStatus.CONFLICT,
            exception.getStatusCode()
        );

        verify(categoryRepository, never())
            .saveAndFlush(any(Category.class));
    }

    @Test
    void shouldNotDeleteAnotherUsersCategory() {
        when(userRepository.findByEmail("test@example.com"))
            .thenReturn(Optional.of(user));

        Long categoryId = 999L;

        when(categoryRepository.findByIdAndUser_Id(
            categoryId,
            user.getId()
        )).thenReturn(Optional.empty());

        ResponseStatusException exception =
            assertThrows(
                ResponseStatusException.class,
                () -> categoryService.delete(categoryId)
            );

        assertEquals(
            HttpStatus.NOT_FOUND,
            exception.getStatusCode()
        );

        verify(categoryRepository, never())
            .delete(any(Category.class));
    }

    @Test
    void shouldDeleteOwnedCategory() {
        when(userRepository.findByEmail("test@example.com"))
            .thenReturn(Optional.of(user));

        Category category = new Category(
            user,
            "Gym",
            TransactionType.EXPENSE
        );

        Long categoryId = 10L;

        when(categoryRepository.findByIdAndUser_Id(
            categoryId,
            user.getId()
        )).thenReturn(Optional.of(category));

        categoryService.delete(categoryId);

        verify(categoryRepository).delete(category);
    }
}
