package com.nextgen.erp.workflow.presentation.controller;

import com.nextgen.erp.workflow.domain.model.WorkflowSettings;
import com.nextgen.erp.workflow.domain.repository.WorkflowSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkflowSettingsController {

    private final WorkflowSettingsRepository settingsRepository;

    @GetMapping
    public ResponseEntity<WorkflowSettings> getSettings() {
        WorkflowSettings settings = settingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> settingsRepository.save(
                        WorkflowSettings.builder()
                                .enableEmailNotifications(true)
                                .defaultAutoRejectionTimeoutDays(7)
                                .strictMode(false)
                                .build()
                ));
        return ResponseEntity.ok(settings);
    }

    @PostMapping
    public ResponseEntity<WorkflowSettings> updateSettings(@RequestBody WorkflowSettings newSettings) {
        WorkflowSettings existing = settingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> WorkflowSettings.builder().build());

        existing.setEnableEmailNotifications(newSettings.getEnableEmailNotifications());
        existing.setDefaultAutoRejectionTimeoutDays(newSettings.getDefaultAutoRejectionTimeoutDays());
        existing.setStrictMode(newSettings.getStrictMode());

        return ResponseEntity.ok(settingsRepository.save(existing));
    }
}
