package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.MrpRun;
import com.nextgen.erp.mrp.domain.entity.MrpRunRequirement;
import com.nextgen.erp.mrp.domain.repository.MrpRunRepository;
import com.nextgen.erp.mrp.domain.repository.MrpRunRequirementRepository;
import com.nextgen.erp.mrp.domain.repository.StateTransitionAuditRepository;
import com.nextgen.erp.mrp.domain.repository.ProductionPlanRepository;
import com.nextgen.erp.mrp.domain.repository.BomRepository;
import com.nextgen.erp.mrp.domain.entity.ProductionPlan;
import com.nextgen.erp.mrp.domain.entity.ProductionPlanItem;
import com.nextgen.erp.mrp.domain.entity.StateTransitionAudit;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MrpRunService {

    private final MrpRunRepository mrpRunRepository;
    private final MrpRunRequirementRepository requirementRepository;
    private final StateTransitionAuditRepository stateTransitionAuditRepository;
    private final ProductionPlanRepository productionPlanRepository;
    private final BomRepository bomRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getRun(UUID runId) {
        MrpRun run = findRun(runId);
        return toResponse(run, requirementRepository.findByRunId(runId));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRuns() {
        return mrpRunRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(run -> toResponse(run, requirementRepository.findByRunId(run.getRunId())))
                .toList();
    }

    @Transactional
    public Map<String, Object> reviewRun(UUID runId) {
        MrpRun run = findRunForUpdate(runId);
        if ("REVIEWED".equalsIgnoreCase(run.getStatus())) {
            return toResponse(run, requirementRepository.findByRunId(runId));
        }
        if (!"CALCULATED".equalsIgnoreCase(run.getStatus())) {
            throw new IllegalStateException("MRP run " + runId + " cannot be reviewed from status " + run.getStatus());
        }
        run.setStatus("REVIEWED");
        StateTransitionAudit audit = new StateTransitionAudit();
        audit.setEntityType("MRP_RUN");
        audit.setEntityId(runId.toString());
        audit.setFromStatus("CALCULATED");
        audit.setToStatus("REVIEWED");
        audit.setAction("REVIEW");
        stateTransitionAuditRepository.save(audit);
        MrpRun saved = mrpRunRepository.save(run);
        return toResponse(saved, requirementRepository.findByRunId(runId));
    }

    @Transactional
    public Map<String, Object> releaseRun(UUID runId) {
        MrpRun run = findRunForUpdate(runId);
        if ("RELEASED".equalsIgnoreCase(run.getStatus())) {
            return toResponse(run, requirementRepository.findByRunId(runId));
        }
        if (!"REVIEWED".equalsIgnoreCase(run.getStatus())) {
            throw new IllegalStateException("MRP run " + runId + " cannot be released from status " + run.getStatus());
        }
        run.setStatus("RELEASED");
        StateTransitionAudit audit = new StateTransitionAudit();
        audit.setEntityType("MRP_RUN");
        audit.setEntityId(runId.toString());
        audit.setFromStatus("REVIEWED");
        audit.setToStatus("RELEASED");
        audit.setAction("RELEASE");
        stateTransitionAuditRepository.save(audit);
        MrpRun saved = mrpRunRepository.save(run);
        return toResponse(saved, requirementRepository.findByRunId(runId));
    }

    @Transactional
    public ProductionPlan createProductionPlan(UUID runId) {
        MrpRun run = findRunForUpdate(runId);
        if (!"RELEASED".equalsIgnoreCase(run.getStatus())) {
            throw new IllegalStateException("MRP run " + runId + " must be RELEASED before creating a production plan");
        }
        var existing = productionPlanRepository.findBySourceMrpRunId(runId);
        if (existing.isPresent()) {
            return existing.get();
        }
        ProductionPlan plan = new ProductionPlan();
        plan.setPlanId("PLAN-MRP-" + runId.toString().substring(0, 8).toUpperCase());
        plan.setSourceMrpRunId(runId);
        plan.setPostingDate(run.getPlanningDate());
        plan.setStatus("DRAFT");
        plan.setCreatedBy("mrp-planner");
        var bom = bomRepository.findById(run.getBomNo())
                .orElseThrow(() -> new IllegalArgumentException("BOM not found for MRP run: " + run.getBomNo()));
        ProductionPlanItem item = new ProductionPlanItem();
        item.setPlanId(plan.getPlanId());
        item.setItemCode(bom.getItemCode());
        item.setBomNo(run.getBomNo());
        item.setPlannedQty(run.getPlannedQty());
        item.setProducedQty(java.math.BigDecimal.ZERO);
        plan.getItems().add(item);
        return productionPlanRepository.save(plan);
    }

    private MrpRun findRun(UUID runId) {
        if (runId == null) {
            throw new IllegalArgumentException("MRP run ID is required");
        }
        return mrpRunRepository.findById(runId)
                .orElseThrow(() -> new IllegalArgumentException("MRP run not found: " + runId));
    }

    private MrpRun findRunForUpdate(UUID runId) {
        if (runId == null) {
            throw new IllegalArgumentException("MRP run ID is required");
        }
        return mrpRunRepository.findByRunIdForUpdate(runId)
                .orElseThrow(() -> new IllegalArgumentException("MRP run not found: " + runId));
    }

    private Map<String, Object> toResponse(MrpRun run, List<MrpRunRequirement> requirements) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("runId", run.getRunId());
        response.put("bomNo", run.getBomNo());
        response.put("plannedQty", run.getPlannedQty());
        response.put("planningDate", run.getPlanningDate());
        response.put("calculationCutoffAt", run.getCalculationCutoffAt());
        response.put("status", run.getStatus());
        response.put("createdAt", run.getCreatedAt());
        response.put("requirements", requirements);
        return response;
    }
}
