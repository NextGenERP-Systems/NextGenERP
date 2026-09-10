package com.nextgen.erp.projects.presentation.controller;

import com.nextgen.erp.projects.application.service.ProjectUserService;
import com.nextgen.erp.projects.domain.model.ProjectUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-users")
@RequiredArgsConstructor
public class ProjectUserController {

    private final ProjectUserService projectUserService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ProjectUser>> getByProjectId(@PathVariable UUID projectId) {
        return ResponseEntity.ok(projectUserService.getProjectUsers(projectId));
    }

    @PostMapping
    public ResponseEntity<ProjectUser> create(@RequestBody ProjectUser projectUser) {
        return ResponseEntity.ok(projectUserService.addProjectUser(projectUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        projectUserService.removeProjectUser(id);
        return ResponseEntity.noContent().build();
    }
}
