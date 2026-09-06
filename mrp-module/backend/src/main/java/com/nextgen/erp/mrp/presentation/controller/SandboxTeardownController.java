package com.nextgen.erp.mrp.presentation.controller;

import com.nextgen.erp.mrp.application.service.TeardownSandboxService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/mrp/sandbox")
@RequiredArgsConstructor
@Tag(name = "Sandbox Teardown & Reset", description = "Clean up and reset test state data")
public class SandboxTeardownController {

    private final TeardownSandboxService teardownSandboxService;

    @PostMapping("/teardown")
    @Operation(summary = "Truncate all MRP test tables cleanly")
    public ResponseEntity<Map<String, String>> teardownSandbox() {
        String result = teardownSandboxService.executeSandboxTeardown();
        return ResponseEntity.ok(Map.of("message", result, "status", "SUCCESS"));
    }
}
