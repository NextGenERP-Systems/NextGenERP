package com.nextgen.erp.projects.presentation.controller;

import com.nextgen.erp.projects.domain.model.ProjectType;
import com.nextgen.erp.projects.infrastructure.repository.ProjectTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-types")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectTypeController {

    private final ProjectTypeRepository repository;

    @GetMapping
    public ResponseEntity<List<ProjectType>> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<ProjectType> create(@RequestBody ProjectType type) {
        return ResponseEntity.ok(repository.save(type));
    }
}
