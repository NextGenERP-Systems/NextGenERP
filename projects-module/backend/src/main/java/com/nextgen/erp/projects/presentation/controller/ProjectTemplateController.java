package com.nextgen.erp.projects.presentation.controller;

import com.nextgen.erp.projects.domain.model.ProjectTemplate;
import com.nextgen.erp.projects.infrastructure.repository.ProjectTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-templates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectTemplateController {

    private final ProjectTemplateRepository repository;

    @GetMapping
    public ResponseEntity<List<ProjectTemplate>> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<ProjectTemplate> create(@RequestBody ProjectTemplate template) {
        return ResponseEntity.ok(repository.save(template));
    }
}
