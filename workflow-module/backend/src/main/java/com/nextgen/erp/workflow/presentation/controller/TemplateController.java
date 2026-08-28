package com.nextgen.erp.workflow.presentation.controller;

import com.nextgen.erp.workflow.application.service.TemplateService;
import com.nextgen.erp.workflow.domain.model.DocumentTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/templates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Simplification for development
public class TemplateController {

    private final TemplateService templateService;

    @GetMapping
    public ResponseEntity<List<DocumentTemplate>> getAllTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentTemplate> getTemplateById(@PathVariable UUID id) {
        return templateService.getTemplateById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DocumentTemplate> createTemplate(@RequestBody DocumentTemplate template) {
        return ResponseEntity.ok(templateService.createTemplate(template));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentTemplate> updateTemplate(@PathVariable UUID id, @RequestBody DocumentTemplate template) {
        try {
            return ResponseEntity.ok(templateService.updateTemplate(id, template));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
