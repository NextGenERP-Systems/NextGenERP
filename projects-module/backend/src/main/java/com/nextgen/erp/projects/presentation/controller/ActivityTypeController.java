package com.nextgen.erp.projects.presentation.controller;

import com.nextgen.erp.projects.domain.model.ActivityType;
import com.nextgen.erp.projects.application.service.ActivityTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/activity-types")
@RequiredArgsConstructor
public class ActivityTypeController {

    private final ActivityTypeService service;

    @GetMapping
    public ResponseEntity<List<ActivityType>> getAll() {
        return ResponseEntity.ok(service.getAllActivityTypes());
    }

    @PostMapping
    public ResponseEntity<ActivityType> create(@RequestBody ActivityType type) {
        return ResponseEntity.ok(service.createActivityType(type));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivityType> update(@PathVariable UUID id, @RequestBody ActivityType type) {
        return ResponseEntity.ok(service.updateActivityType(id, type));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteActivityType(id);
        return ResponseEntity.noContent().build();
    }
}
