package com.nextgen.erp.mrp.presentation.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Non-sensitive runtime identity endpoint used to verify the selected database
 * before exercising state-changing MRP operations.
 */
@RestController
@RequestMapping("/api/v1/mrp/runtime")
@RequiredArgsConstructor
public class RuntimeController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/database")
    public Map<String, Object> databaseIdentity() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("databaseName", jdbcTemplate.queryForObject("select current_database()", String.class));
        response.put("serverVersion", jdbcTemplate.queryForObject("select current_setting('server_version')", String.class));
        boolean migrationTablePresent = jdbcTemplate.queryForObject(
                "select to_regclass('public.flyway_schema_history') is not null", Boolean.class);
        response.put("migrationTablePresent", migrationTablePresent);
        if (migrationTablePresent) {
            response.put("migrationVersion", jdbcTemplate.queryForObject(
                    "select coalesce(version, 'baseline') from public.flyway_schema_history " +
                            "where success = true order by installed_rank desc limit 1", String.class));
        }
        return response;
    }
}
