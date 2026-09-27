package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.ProductionPlan;
import com.nextgen.erp.mrp.domain.entity.ProductionPlanItem;
import com.nextgen.erp.mrp.domain.repository.ProductionPlanRepository;
import com.nextgen.erp.mrp.domain.repository.StateTransitionAuditRepository;
import com.nextgen.erp.mrp.domain.repository.WorkOrderRepository;
import com.nextgen.erp.mrp.domain.repository.MrpRunRequirementRepository;
import com.nextgen.erp.mrp.domain.repository.BomRepository;
import com.nextgen.erp.mrp.domain.entity.MrpRunRequirement;
import com.nextgen.erp.mrp.domain.entity.WorkOrder;
import com.nextgen.erp.mrp.domain.entity.StateTransitionAudit;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Set;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class ProductionPlanService {

    private static final Set<String> ALLOWED_STATUSES = Set.of("DRAFT", "SUBMITTED", "COMPLETED", "CANCELLED");

    private final ProductionPlanRepository productionPlanRepository;
    private final StateTransitionAuditRepository stateTransitionAuditRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderService workOrderService;
    private final MrpRunRequirementRepository mrpRunRequirementRepository;
    private final BomRepository bomRepository;

    @Transactional(readOnly = true)
    public List<ProductionPlan> getAllPlans() {
        return productionPlanRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public ProductionPlan getPlanById(String planId) {
        return productionPlanRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("Production Plan not found: " + planId));
    }

    @Transactional
    public ProductionPlan createProductionPlan(ProductionPlan plan) {
        if (plan.getPostingDate() == null) {
            plan.setPostingDate(LocalDate.now());
        }
        if (plan.getCreatedAt() == null) {
            plan.setCreatedAt(ZonedDateTime.now());
        }
        if (plan.getStatus() == null) {
            plan.setStatus("DRAFT");
        }
        String normalizedStatus = plan.getStatus().toUpperCase();
        if (!ALLOWED_STATUSES.contains(normalizedStatus)) {
            throw new IllegalArgumentException("Unsupported production plan status: " + plan.getStatus());
        }
        plan.setStatus(normalizedStatus);
        if (plan.getItems() != null) {
            for (ProductionPlanItem item : plan.getItems()) {
                item.setPlanId(plan.getPlanId());
            }
        }
        return productionPlanRepository.save(plan);
    }

    @Transactional
    public ProductionPlan submitProductionPlan(String planId) {
        ProductionPlan plan = productionPlanRepository.findByPlanId(planId)
                .orElseThrow(() -> new IllegalArgumentException("Production Plan not found: " + planId));
        if ("SUBMITTED".equalsIgnoreCase(plan.getStatus())) {
            return plan;
        }
        if (!"DRAFT".equalsIgnoreCase(plan.getStatus())) {
            throw new IllegalStateException("Production plan " + planId
                    + " cannot be submitted from status " + plan.getStatus());
        }
        String previousStatus = plan.getStatus();
        plan.setStatus("SUBMITTED");
        StateTransitionAudit audit = new StateTransitionAudit();
        audit.setEntityType("PRODUCTION_PLAN");
        audit.setEntityId(planId);
        audit.setFromStatus(previousStatus);
        audit.setToStatus("SUBMITTED");
        audit.setAction("SUBMIT");
        stateTransitionAuditRepository.save(audit);
        return productionPlanRepository.save(plan);
    }

    @Transactional
    public List<WorkOrder> generateWorkOrders(String planId) {
        ProductionPlan plan = productionPlanRepository.findByPlanIdForUpdate(planId)
                .orElseThrow(() -> new IllegalArgumentException("Production Plan not found: " + planId));
        if (!"SUBMITTED".equalsIgnoreCase(plan.getStatus())) {
            throw new IllegalStateException("Production plan " + planId + " must be SUBMITTED before generating Work Orders");
        }
        List<WorkOrder> result = new ArrayList<>();
        for (ProductionPlanItem item : plan.getItems()) {
            String workOrderId = "WO-PLAN-" + planId + "-" + item.getId();
            WorkOrder existing = workOrderRepository.findById(workOrderId).orElse(null);
            WorkOrder parent;
            if (existing != null) {
                parent = existing;
            } else {
                WorkOrder workOrder = new WorkOrder();
                workOrder.setWorkOrderId(workOrderId);
                workOrder.setProductionPlanId(plan.getPlanId());
                workOrder.setProductionItem(item.getItemCode());
                workOrder.setBomNo(item.getBomNo());
                workOrder.setQtyToProduce(item.getPlannedQty());
                workOrder.setPlannedStartDate(plan.getPostingDate().atStartOfDay().atZone(java.time.ZoneId.systemDefault()));
                workOrder.setPlannedEndDate(workOrder.getPlannedStartDate().plusDays(1));
                workOrder.setStatus("NOT_STARTED");
                parent = workOrderService.createWorkOrder(workOrder);
            }
            result.add(parent);

            if (plan.getSourceMrpRunId() != null) {
                List<MrpRunRequirement> requirements = mrpRunRequirementRepository
                        .findByRunId(plan.getSourceMrpRunId());
                for (MrpRunRequirement requirement : requirements) {
                    if (!"SPAWN_WORK_ORDER".equalsIgnoreCase(requirement.getRecommendedAction())
                            || requirement.getShortageQty() == null
                            || requirement.getShortageQty().signum() <= 0) {
                        continue;
                    }
                    var childBom = bomRepository.findByItemCodeAndIsDefaultTrue(requirement.getItemCode())
                            .orElseThrow(() -> new IllegalStateException("No default BOM for manufactured subassembly "
                                    + requirement.getItemCode()));
                    String childId = workOrderId + "-CHILD-" + requirement.getItemCode();
                    WorkOrder existingChild = workOrderRepository.findById(childId).orElse(null);
                    if (existingChild != null) {
                        result.add(existingChild);
                        continue;
                    }
                    WorkOrder child = new WorkOrder();
                    child.setWorkOrderId(childId);
                    child.setProductionPlanId(plan.getPlanId());
                    child.setParentWoId(parent.getWorkOrderId());
                    child.setProductionItem(requirement.getItemCode());
                    child.setBomNo(childBom.getBomNo());
                    child.setQtyToProduce(requirement.getShortageQty());
                    child.setPlannedStartDate(parent.getPlannedStartDate());
                    child.setPlannedEndDate(parent.getPlannedEndDate());
                    child.setStatus("NOT_STARTED");
                    result.add(workOrderService.createWorkOrder(child));
                }
            }
        }
        return result;
    }
}
