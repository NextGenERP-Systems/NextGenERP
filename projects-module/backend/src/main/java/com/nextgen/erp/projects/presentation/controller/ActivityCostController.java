package com.nextgen.erp.projects.presentation.controller;

import com.nextgen.erp.projects.domain.model.ActivityCost;
import com.nextgen.erp.projects.application.service.ActivityCostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/activity-costs")
@RequiredArgsConstructor
public class ActivityCostController {

    private final ActivityCostService service;

    @GetMapping
    public ResponseEntity<List<ActivityCost>> getAll() {
        return ResponseEntity.ok(service.getAllActivityCosts());
    }

    @PostMapping
    public ResponseEntity<ActivityCost> create(@RequestBody ActivityCost cost) {
        return ResponseEntity.ok(service.createActivityCost(cost));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivityCost> update(@PathVariable UUID id, @RequestBody ActivityCost cost) {
        return ResponseEntity.ok(service.updateActivityCost(id, cost));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteActivityCost(id);
        return ResponseEntity.noContent().build();
    }
}
