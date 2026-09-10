package com.nextgen.erp.projects.presentation.controller;

import com.nextgen.erp.projects.domain.model.ProjectType;
import com.nextgen.erp.projects.application.service.ProjectTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-types")
@RequiredArgsConstructor
public class ProjectTypeController {

    private final ProjectTypeService service;

    @GetMapping
    public ResponseEntity<List<ProjectType>> getAll() {
        return ResponseEntity.ok(service.getAllProjectTypes());
    }

    @PostMapping
    public ResponseEntity<ProjectType> create(@RequestBody ProjectType type) {
        return ResponseEntity.ok(service.createProjectType(type));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectType> update(@PathVariable UUID id, @RequestBody ProjectType type) {
        return ResponseEntity.ok(service.updateProjectType(id, type));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteProjectType(id);
        return ResponseEntity.noContent().build();
    }
}
