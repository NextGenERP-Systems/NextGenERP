package com.nextgen.erp.workflow.presentation.controller;

import com.nextgen.erp.workflow.application.service.WorkflowService;
import com.nextgen.erp.workflow.domain.model.Workflow;
import com.nextgen.erp.workflow.domain.model.WorkflowState;
import com.nextgen.erp.workflow.domain.model.WorkflowTransition;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workflows")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Simplification for development
public class WorkflowController {

    private final WorkflowService workflowService;

    @GetMapping
    public ResponseEntity<List<Workflow>> getAllWorkflows() {
        return ResponseEntity.ok(workflowService.getAllWorkflows());
    }

    @PostMapping
    public ResponseEntity<Workflow> createWorkflow(@RequestBody Workflow workflow) {
        return ResponseEntity.ok(workflowService.createWorkflow(workflow));
    }

    @GetMapping("/{workflowId}/states")
    public ResponseEntity<List<WorkflowState>> getStates(@PathVariable UUID workflowId) {
        return ResponseEntity.ok(workflowService.getStatesByWorkflowId(workflowId));
    }

    @PostMapping("/{workflowId}/states")
    public ResponseEntity<WorkflowState> createState(
            @PathVariable UUID workflowId,
            @RequestBody WorkflowState state) {
        return ResponseEntity.ok(workflowService.createState(workflowId, state));
    }

    @GetMapping("/{workflowId}/transitions")
    public ResponseEntity<List<WorkflowTransition>> getTransitions(@PathVariable UUID workflowId) {
        return ResponseEntity.ok(workflowService.getTransitionsByWorkflowId(workflowId));
    }

    @PostMapping("/{workflowId}/transitions")
    public ResponseEntity<WorkflowTransition> createTransition(
            @PathVariable UUID workflowId,
            @RequestBody WorkflowTransition transition) {
        return ResponseEntity.ok(workflowService.createTransition(workflowId, transition));
    }
}
