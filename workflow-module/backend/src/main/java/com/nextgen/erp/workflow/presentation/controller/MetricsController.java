package com.nextgen.erp.workflow.presentation.controller;

import com.nextgen.erp.workflow.domain.model.Document;
import com.nextgen.erp.workflow.domain.model.Workflow;
import com.nextgen.erp.workflow.domain.model.WorkflowHistory;
import com.nextgen.erp.workflow.domain.model.WorkflowState;
import com.nextgen.erp.workflow.domain.repository.DocumentRepository;
import com.nextgen.erp.workflow.domain.repository.WorkflowHistoryRepository;
import com.nextgen.erp.workflow.domain.repository.WorkflowStateRepository;
import com.nextgen.erp.workflow.domain.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/metrics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MetricsController {

    private final DocumentRepository documentRepository;
    private final WorkflowHistoryRepository historyRepository;
    private final WorkflowStateRepository stateRepository;
    private final WorkflowRepository workflowRepository;

    @GetMapping("/documents-by-status")
    public ResponseEntity<Map<String, Long>> getDocumentsByStatus() {
        Map<String, Long> metrics = new HashMap<>();
        for (Object[] row : documentRepository.countDocumentsByStatus()) {
            if (row[0] != null && row[1] != null) {
                metrics.put((String) row[0], (Long) row[1]);
            }
        }
        return ResponseEntity.ok(metrics);
    }
    
    @GetMapping("/pending-by-workflow")
    public ResponseEntity<Map<String, Long>> getPendingByWorkflow() {
        Map<UUID, String> workflowNames = workflowRepository.findAll().stream()
                .collect(Collectors.toMap(Workflow::getId, Workflow::getWorkflowName, (existing, replacement) -> existing));
        Map<String, Long> metrics = new HashMap<>();
        for (Object[] row : documentRepository.countPendingByWorkflow()) {
            if (row[0] != null && row[1] != null) {
                UUID wId = (UUID) row[0];
                Long count = (Long) row[1];
                String name = workflowNames.getOrDefault(wId, wId.toString().substring(0, Math.min(8, wId.toString().length())));
                metrics.put(name, metrics.getOrDefault(name, 0L) + count);
            }
        }
        return ResponseEntity.ok(metrics);
    }


    @GetMapping("/time-in-state")
    public ResponseEntity<List<Map<String, Object>>> getTimeInStateAnalytics() {
        List<WorkflowHistory> historyList = historyRepository.findAll();
        Map<UUID, List<WorkflowHistory>> groupedByDoc = historyList.stream()
                .filter(h -> h.getCreatedAt() != null)
                .sorted(Comparator.comparing(WorkflowHistory::getCreatedAt))
                .collect(Collectors.groupingBy(WorkflowHistory::getDocumentId));

        Map<UUID, List<Long>> stateDurationsMinutes = new HashMap<>();

        groupedByDoc.forEach((docId, logs) -> {
            for (int i = 0; i < logs.size() - 1; i++) {
                WorkflowHistory current = logs.get(i);
                WorkflowHistory next = logs.get(i + 1);
                if (current.getToStateId() != null && next.getCreatedAt() != null) {
                    long minutes = Duration.between(current.getCreatedAt(), next.getCreatedAt()).toMinutes();
                    stateDurationsMinutes.computeIfAbsent(current.getToStateId(), k -> new ArrayList<>()).add(minutes);
                }
            }
        });

        List<WorkflowState> allStates = stateRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (WorkflowState state : allStates) {
            List<Long> durations = stateDurationsMinutes.getOrDefault(state.getId(), Collections.emptyList());
            double avgMinutes = durations.isEmpty() ? 0.0 : durations.stream().mapToLong(Long::longValue).average().orElse(0.0);
            
            Map<String, Object> item = new HashMap<>();
            item.put("stateId", state.getId());
            item.put("stateName", state.getStateName());
            item.put("colorCode", state.getColorCode());
            item.put("avgMinutes", Math.round(avgMinutes * 10.0) / 10.0);
            item.put("sampleCount", durations.size());
            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        long totalDocs = documentRepository.count();
        long totalActions = historyRepository.count();
        long totalStates = stateRepository.count();
        
        summary.put("totalDocuments", totalDocs);
        summary.put("totalActions", totalActions);
        summary.put("totalStates", totalStates);
        return ResponseEntity.ok(summary);
    }
}
