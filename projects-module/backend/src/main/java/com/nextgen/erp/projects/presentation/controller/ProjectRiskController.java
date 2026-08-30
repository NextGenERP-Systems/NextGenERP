package com.nextgen.erp.projects.presentation.controller;

import com.nextgen.erp.projects.domain.model.ProjectRisk;
import com.nextgen.erp.projects.domain.repository.ProjectRiskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/risks")
@RequiredArgsConstructor
public class ProjectRiskController {

    private final ProjectRiskRepository repository;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ProjectRisk>> getRisksByProject(@PathVariable UUID projectId) {
        return ResponseEntity.ok(repository.findByProjectId(projectId));
    }

    @PostMapping
    public ResponseEntity<ProjectRisk> createRisk(@RequestBody ProjectRisk risk) {
        return ResponseEntity.ok(repository.save(risk));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectRisk> updateRisk(@PathVariable UUID id, @RequestBody ProjectRisk riskDetails) {
        return repository.findById(id).map(risk -> {
            risk.setTitle(riskDetails.getTitle());
            risk.setDescription(riskDetails.getDescription());
            risk.setSeverity(riskDetails.getSeverity());
            risk.setStatus(riskDetails.getStatus());
            risk.setAssigneeId(riskDetails.getAssigneeId());
            return ResponseEntity.ok(repository.save(risk));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRisk(@PathVariable UUID id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
