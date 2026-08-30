package com.nextgen.erp.projects.presentation.controller;

import com.nextgen.erp.projects.domain.model.TaskDependency;
import com.nextgen.erp.projects.domain.repository.TaskDependencyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dependencies")
@RequiredArgsConstructor
public class TaskDependencyController {

    private final TaskDependencyRepository repository;

    @GetMapping("/task/{taskId}/successors")
    public ResponseEntity<List<TaskDependency>> getSuccessors(@PathVariable UUID taskId) {
        return ResponseEntity.ok(repository.findByPredecessorId(taskId));
    }
    
    @GetMapping("/task/{taskId}/predecessors")
    public ResponseEntity<List<TaskDependency>> getPredecessors(@PathVariable UUID taskId) {
        return ResponseEntity.ok(repository.findBySuccessorId(taskId));
    }

    @PostMapping
    public ResponseEntity<TaskDependency> createDependency(@RequestBody TaskDependency dependency) {
        return ResponseEntity.ok(repository.save(dependency));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDependency(@PathVariable UUID id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
