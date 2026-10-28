
package com.financeflow.health;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class DatabaseHealthController {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseHealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/v1/database-health")
    public Map<String, String> databaseHealth() {

        String appName = jdbcTemplate.queryForObject(
            "SELECT application_name FROM app_metadata LIMIT 1",
            String.class
        );

        return Map.of(
            "status", "UP",
            "database", "PostgreSQL",
            "application", appName
        );
    }
}
