
package com.financeflow.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name is too long")
    String name,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    @Size(max = 255)
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 12, max = 64,
          message = "Password must be 12-64 characters")
    String password

) {}
