package com.nextgen.erp.projects.presentation.controller;

import com.nextgen.erp.projects.domain.model.ProjectTemplate;
import com.nextgen.erp.projects.application.service.ProjectTemplateService;
import com.nextgen.erp.projects.presentation.dto.ProjectTemplateDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-templates")
@RequiredArgsConstructor
public class ProjectTemplateController {

    private final ProjectTemplateService service;

    @GetMapping
    public ResponseEntity<List<ProjectTemplateDTO>> getAll() {
        return ResponseEntity.ok(service.getAllTemplates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectTemplateDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getTemplateById(id));
    }

    @PostMapping
    public ResponseEntity<ProjectTemplateDTO> create(@RequestBody ProjectTemplateDTO dto) {
        return ResponseEntity.ok(service.createTemplate(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectTemplateDTO> update(@PathVariable UUID id, @RequestBody ProjectTemplateDTO dto) {
        return ResponseEntity.ok(service.updateTemplate(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
