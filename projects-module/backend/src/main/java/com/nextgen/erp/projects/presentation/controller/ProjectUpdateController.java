package com.nextgen.erp.projects.presentation.controller;

import com.nextgen.erp.projects.application.service.ProjectUpdateService;
import com.nextgen.erp.projects.domain.model.ProjectUpdate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-updates")
@RequiredArgsConstructor
public class ProjectUpdateController {

    private final ProjectUpdateService projectUpdateService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ProjectUpdate>> getByProjectId(@PathVariable UUID projectId) {
        return ResponseEntity.ok(projectUpdateService.getProjectUpdates(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectUpdate> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(projectUpdateService.getProjectUpdateById(id));
    }

    @PostMapping
    public ResponseEntity<ProjectUpdate> create(@RequestBody ProjectUpdate update) {
        return ResponseEntity.ok(projectUpdateService.createProjectUpdate(update));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectUpdate> update(@PathVariable UUID id, @RequestBody ProjectUpdate update) {
        return ResponseEntity.ok(projectUpdateService.updateProjectUpdate(id, update));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        projectUpdateService.deleteProjectUpdate(id);
        return ResponseEntity.noContent().build();
    }
}
