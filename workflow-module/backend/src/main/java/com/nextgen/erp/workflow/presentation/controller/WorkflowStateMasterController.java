package com.nextgen.erp.workflow.presentation.controller;

import com.nextgen.erp.workflow.domain.model.WorkflowStateMaster;
import com.nextgen.erp.workflow.domain.repository.WorkflowStateMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/master-states")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class WorkflowStateMasterController {

    private final WorkflowStateMasterRepository repository;

    @GetMapping
    public ResponseEntity<List<WorkflowStateMaster>> getAllMasterStates() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<WorkflowStateMaster> createMasterState(@RequestBody WorkflowStateMaster stateMaster) {
        return ResponseEntity.ok(repository.save(stateMaster));
    }
}
