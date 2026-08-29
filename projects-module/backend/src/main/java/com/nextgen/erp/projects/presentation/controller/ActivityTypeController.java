package com.nextgen.erp.projects.presentation.controller;

import com.nextgen.erp.projects.domain.model.ActivityType;
import com.nextgen.erp.projects.infrastructure.repository.ActivityTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/activity-types")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ActivityTypeController {

    private final ActivityTypeRepository repository;

    @GetMapping
    public ResponseEntity<List<ActivityType>> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<ActivityType> create(@RequestBody ActivityType type) {
        return ResponseEntity.ok(repository.save(type));
    }
}
