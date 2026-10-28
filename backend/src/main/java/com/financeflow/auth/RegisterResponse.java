
package com.financeflow.auth;

public record RegisterResponse(
    Long id,
    String name,
    String email,
    String currency
) {}
