package com.nextgen.erp.projects.presentation.controller;

import com.nextgen.erp.projects.application.service.TaskService;
import com.nextgen.erp.projects.domain.model.Task;
import com.nextgen.erp.projects.domain.model.TaskStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task Management API")
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/{projectId}/tasks")
    @Operation(summary = "Get tasks by project ID")
    public ResponseEntity<List<Task>> getTasksByProjectId(@PathVariable UUID projectId) {
        return ResponseEntity.ok(taskService.getTasksByProjectId(projectId));
    }

    @GetMapping("/tasks/{id}")
    @Operation(summary = "Get a task by ID")
    public ResponseEntity<Task> getTaskById(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping("/{projectId}/tasks")
    @Operation(summary = "Create a new task for a project")
    public ResponseEntity<Task> createTask(@PathVariable UUID projectId, @RequestBody Task task) {
        return new ResponseEntity<>(taskService.createTask(projectId, task), HttpStatus.CREATED);
    }

    @PutMapping("/tasks/{id}")
    @Operation(summary = "Update a task")
    public ResponseEntity<Task> updateTask(@PathVariable UUID id, @RequestBody Task taskDetails) {
        return ResponseEntity.ok(taskService.updateTask(id, taskDetails));
    }

    @PatchMapping("/tasks/{id}/status")
    @Operation(summary = "Quick update task status (e.g. for Kanban drag-and-drop)")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        TaskStatus status = TaskStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status));
    }

    @DeleteMapping("/tasks/{id}")
    @Operation(summary = "Delete a task")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
