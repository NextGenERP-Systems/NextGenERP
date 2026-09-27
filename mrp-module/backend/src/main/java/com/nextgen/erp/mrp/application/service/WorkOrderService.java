package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.*;
import com.nextgen.erp.mrp.domain.repository.BomRepository;
import com.nextgen.erp.mrp.domain.repository.JobCardRepository;
import com.nextgen.erp.mrp.domain.repository.InventoryMovementRepository;
import com.nextgen.erp.mrp.domain.repository.MockItemRepository;
import com.nextgen.erp.mrp.domain.repository.QualityInspectionRepository;
import com.nextgen.erp.mrp.domain.repository.StateTransitionAuditRepository;
import com.nextgen.erp.mrp.domain.entity.StateTransitionAudit;
import com.nextgen.erp.mrp.domain.repository.RoutingRepository;
import com.nextgen.erp.mrp.domain.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private static final Set<String> ALLOWED_STATUSES = Set.of(
            "DRAFT", "NOT_STARTED", "SUBMITTED", "IN_PROGRESS", "COMPLETED", "CANCELLED");

    private final WorkOrderRepository workOrderRepository;
    private final BomRepository bomRepository;
    private final RoutingRepository routingRepository;
    private final JobCardRepository jobCardRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final MockItemRepository mockItemRepository;
    private final QualityInspectionRepository qualityInspectionRepository;
    private final StateTransitionAuditRepository stateTransitionAuditRepository;

    @Transactional(readOnly = true)
    public List<WorkOrder> getAllWorkOrders() {
        return workOrderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public WorkOrder getWorkOrderById(String id) {
        return workOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Work Order not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<WorkOrder> getChildWorkOrders(String parentWoId) {
        return workOrderRepository.findByParentWoId(parentWoId);
    }

    @Transactional
    public WorkOrder createWorkOrder(WorkOrder wo) {
        if (wo.getQtyToProduce() == null || wo.getQtyToProduce().signum() <= 0) {
            throw new IllegalArgumentException("Work order quantity must be greater than zero");
        }
        if (wo.getPlannedStartDate() == null || wo.getPlannedEndDate() == null) {
            throw new IllegalArgumentException("Work order planned start and end dates are required");
        }
        if (wo.getPlannedEndDate().isBefore(wo.getPlannedStartDate())) {
            throw new IllegalArgumentException("Work order planned end date cannot precede its start date");
        }
        if (wo.getWorkOrderId() == null || wo.getWorkOrderId().isBlank()) {
            wo.setWorkOrderId("WO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (wo.getStatus() == null || wo.getStatus().isBlank()) {
            wo.setStatus("NOT_STARTED");
        }
        String normalizedStatus = wo.getStatus().toUpperCase();
        if (!ALLOWED_STATUSES.contains(normalizedStatus)) {
            throw new IllegalArgumentException("Unsupported work order status: " + wo.getStatus());
        }
        wo.setStatus(normalizedStatus);
        if (wo.getProducedQty() == null) {
            wo.setProducedQty(BigDecimal.ZERO);
        }

        if (wo.getProductionItem() != null && !wo.getProductionItem().isBlank()) {
            if (!mockItemRepository.existsById(wo.getProductionItem())) {
                throw new IllegalArgumentException("Production item master not found: " + wo.getProductionItem());
            }
        }

        if (wo.getBomNo() != null && !wo.getBomNo().isBlank()) {
            if (!bomRepository.existsById(wo.getBomNo())) {
                throw new IllegalArgumentException("BOM not found: " + wo.getBomNo());
            }
        }

        List<JobCard> jobCardsToSave = new ArrayList<>();
        BigDecimal[] plannedMaterialCost = {BigDecimal.ZERO};
        BigDecimal[] plannedOperatingCost = {BigDecimal.ZERO};

        // Auto-populate items and routing operations from BOM if available
        if (wo.getBomNo() != null && !wo.getBomNo().isBlank()) {
            bomRepository.findById(wo.getBomNo()).ifPresent(bom -> {
                if (wo.getItemName() == null || wo.getItemName().isBlank()) {
                    wo.setItemName(bom.getItemName());
                }
                if (wo.getProductionItem() == null || wo.getProductionItem().isBlank()) {
                    wo.setProductionItem(bom.getItemCode());
                }

                // If items list is empty, populate from BOM items
                if (wo.getItems() == null || wo.getItems().isEmpty()) {
                    List<WorkOrderItem> woItems = new ArrayList<>();
                    if (bom.getItems() != null) {
                        for (BomItem bItem : bom.getItems()) {
                            WorkOrderItem item = new WorkOrderItem();
                            item.setWorkOrder(wo);
                            item.setItemCode(bItem.getItemCode());
                            item.setItemName(bItem.getItemName());
                            item.setRequiredQty(bItem.getQty().multiply(wo.getQtyToProduce()));
                            item.setTransferredQty(BigDecimal.ZERO);
                            item.setActualConsumedQty(BigDecimal.ZERO);
                            item.setUom(bItem.getUom());
                            item.setStandardRate(bItem.getStandardRate());
                            woItems.add(item);
                            if (bItem.getStandardRate() != null) {
                                plannedMaterialCost[0] = plannedMaterialCost[0]
                                        .add(bItem.getQty().multiply(bItem.getStandardRate()).multiply(wo.getQtyToProduce()));
                            }
                        }
                    }
                    wo.setItems(woItems);
                }

                if (wo.getPlannedOperatingCost() == null && bom.getOperations() != null) {
                    bom.getOperations().forEach(operation -> {
                        if (operation.getOperatingCost() != null) {
                            plannedOperatingCost[0] = plannedOperatingCost[0]
                                    .add(operation.getOperatingCost().multiply(wo.getQtyToProduce()));
                        }
                    });
                }

                // Routing operations logic
                String routingId = bom.getRoutingId();
                if (routingId != null && !routingId.isBlank()) {
                    routingRepository.findById(routingId).ifPresent(routing -> {
                        if (routing.getOperations() != null && !routing.getOperations().isEmpty()) {
                            List<WorkOrderOperation> woOps = new ArrayList<>();
                            for (RoutingOperation rOp : routing.getOperations()) {
                                WorkOrderOperation woOp = new WorkOrderOperation();
                                woOp.setWorkOrder(wo);
                                woOp.setSequenceNo(rOp.getSequenceNo());
                                woOp.setOperationId(rOp.getOperationId());
                                if (rOp.getWorkstationId() == null || rOp.getWorkstationId().isBlank()) {
                                    throw new IllegalArgumentException("Routing operation is missing a workstation");
                                }
                                woOp.setWorkstationId(rOp.getWorkstationId());
                                woOp.setTimeInMins(rOp.getTimeInMins());
                                woOp.setCompletedQty(BigDecimal.ZERO);
                                woOp.setStatus("PENDING");
                                woOps.add(woOp);

                                // Auto-create Job Card for each operation
                                JobCard jc = new JobCard();
                                jc.setJobCardId("JC-" + wo.getWorkOrderId() + "-" + String.format("%02d", rOp.getSequenceNo()));
                                jc.setWorkOrderId(wo.getWorkOrderId());
                                jc.setOperationId(rOp.getOperationId());
                                jc.setWorkstationId(woOp.getWorkstationId());
                                jc.setForQuantity(wo.getQtyToProduce());
                                jc.setCompletedQuantity(BigDecimal.ZERO);
                                jc.setStatus("OPEN");
                                jc.setScheduledStartTime(wo.getPlannedStartDate());
                                jc.setScheduledEndTime(wo.getPlannedEndDate());
                                jc.setTotalTimeInMins(rOp.getTimeInMins());
                                jobCardsToSave.add(jc);
                            }
                            wo.setOperations(woOps);
                        }
                    });
                }
            });
        }

        if (wo.getPlannedMaterialCost() == null) {
            wo.setPlannedMaterialCost(plannedMaterialCost[0]);
        }
        if (wo.getPlannedOperatingCost() == null) {
            wo.setPlannedOperatingCost(plannedOperatingCost[0]);
        }

        WorkOrder savedWo = workOrderRepository.saveAndFlush(wo);
        if (!jobCardsToSave.isEmpty()) {
            for (int i = 0; i < jobCardsToSave.size() && i < savedWo.getOperations().size(); i++) {
                jobCardsToSave.get(i).setWorkOrderOperationId(savedWo.getOperations().get(i).getId());
            }
            jobCardRepository.saveAll(jobCardsToSave);
        }
        return savedWo;
    }

    @Transactional
    public WorkOrder submitWorkOrder(String workOrderId) {
        WorkOrder wo = workOrderRepository.findByIdForUpdate(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work Order not found: " + workOrderId));

        if ("SUBMITTED".equalsIgnoreCase(wo.getStatus())) {
            return wo;
        }
        if (!"NOT_STARTED".equalsIgnoreCase(wo.getStatus()) && !"DRAFT".equalsIgnoreCase(wo.getStatus())) {
            throw new IllegalStateException("Work Order " + workOrderId + " cannot be submitted from status " + wo.getStatus());
        }
        String previousStatus = wo.getStatus();
        wo.setStatus("SUBMITTED");
        for (WorkOrderItem item : wo.getItems()) {
            String sourceReference = "WO-RESERVE:" + workOrderId + ":" + item.getItemCode();
            if (inventoryMovementRepository.findBySourceReference(sourceReference).isEmpty()) {
                InventoryMovement reservation = new InventoryMovement();
                reservation.setItemCode(item.getItemCode());
                reservation.setWarehouseId(wo.getSourceWarehouse());
                reservation.setQuantity(item.getRequiredQty());
                reservation.setMovementType("RESERVATION");
                reservation.setWorkOrderId(workOrderId);
                reservation.setSourceReference(sourceReference);
                inventoryMovementRepository.save(reservation);
            }
        }
        recordTransition(workOrderId, previousStatus, "SUBMITTED", "SUBMIT");
        return workOrderRepository.save(wo);
    }

    /**
     * Real-Time Material Consumption API endpoint logic with pessimistic row lock.
     * Updates actual_consumed_qty allowing over-consumption tracking.
     */
    @Transactional
    public WorkOrder logMaterialConsumption(String workOrderId, String itemCode, BigDecimal consumeQty) {
        return logMaterialConsumption(workOrderId, itemCode, consumeQty, null);
    }

    @Transactional
    public WorkOrder logMaterialConsumption(String workOrderId, String itemCode, BigDecimal consumeQty,
                                             String idempotencyKey) {
        if (consumeQty == null || consumeQty.signum() <= 0) {
            throw new IllegalArgumentException("Material consumption quantity must be greater than zero");
        }
        WorkOrder wo = workOrderRepository.findByIdForUpdate(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work Order not found for lock: " + workOrderId));

        String requestKey = idempotencyKey == null || idempotencyKey.isBlank()
                ? UUID.randomUUID().toString()
                : idempotencyKey.trim();
        String sourceReference = "WO-CONSUME:" + workOrderId + ":" + requestKey;
        if (inventoryMovementRepository.findBySourceReference(sourceReference).isPresent()) {
            return wo;
        }

        WorkOrderItem woItem = wo.getItems().stream()
                .filter(i -> i.getItemCode().equalsIgnoreCase(itemCode))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Item " + itemCode + " not found in WO " + workOrderId));

        BigDecimal currentConsumed = woItem.getActualConsumedQty() != null ? woItem.getActualConsumedQty() : BigDecimal.ZERO;
        woItem.setActualConsumedQty(currentConsumed.add(consumeQty));

        // Recalculate actual material cost
        BigDecimal currentActualCost = wo.getActualMaterialCost() != null ? wo.getActualMaterialCost() : BigDecimal.ZERO;
        BigDecimal incrementalCost = consumeQty.multiply(woItem.getStandardRate() != null ? woItem.getStandardRate() : BigDecimal.ZERO);
        wo.setActualMaterialCost(currentActualCost.add(incrementalCost));

        if ("NOT_STARTED".equals(wo.getStatus()) || "SUBMITTED".equals(wo.getStatus())) {
            wo.setStatus("IN_PROGRESS");
        }

        WorkOrder savedWo = workOrderRepository.save(wo);

        InventoryMovement movement = new InventoryMovement();
        movement.setItemCode(woItem.getItemCode());
        movement.setWarehouseId(wo.getSourceWarehouse());
        movement.setQuantity(consumeQty);
        movement.setMovementType("CONSUMPTION");
        movement.setWorkOrderId(workOrderId);
        movement.setSourceReference(sourceReference);
        inventoryMovementRepository.save(movement);

        return savedWo;
    }

    @Transactional
    public WorkOrder completeWorkOrder(String workOrderId) {
        WorkOrder wo = workOrderRepository.findByIdForUpdate(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work Order not found for lock: " + workOrderId));
        String sourceReference = "WO-FINISH:" + workOrderId;
        if (inventoryMovementRepository.findBySourceReference(sourceReference).isPresent()) {
            if (!"COMPLETED".equalsIgnoreCase(wo.getStatus())
                    || wo.getProducedQty() == null
                    || wo.getProducedQty().compareTo(wo.getQtyToProduce()) != 0
                    || wo.getActualEndDate() == null) {
                wo.setStatus("COMPLETED");
                wo.setProducedQty(wo.getQtyToProduce());
                if (wo.getActualEndDate() == null) {
                    wo.setActualEndDate(java.time.ZonedDateTime.now());
                }
                if (wo.getActualStartDate() == null) {
                    wo.setActualStartDate(wo.getActualEndDate());
                }
                return workOrderRepository.save(wo);
            }
            return wo;
        }
        if (!("IN_PROGRESS".equals(wo.getStatus()) || "SUBMITTED".equals(wo.getStatus()))) {
            throw new IllegalStateException("Work Order " + workOrderId + " cannot complete from status " + wo.getStatus());
        }
        List<WorkOrder> children = workOrderRepository.findByParentWoId(workOrderId);
        if (children.stream().anyMatch(child -> !"COMPLETED".equalsIgnoreCase(child.getStatus()))) {
            throw new IllegalStateException("All child Work Orders must be completed before " + workOrderId);
        }
        var inspections = qualityInspectionRepository.findByWorkOrderId(workOrderId);
        if (inspections == null || inspections.isEmpty()
                || inspections.stream().anyMatch(inspection -> !"PASSED".equalsIgnoreCase(inspection.getStatus()))) {
            throw new IllegalStateException("Quality inspection approval is required before completing Work Order " + workOrderId);
        }
        BigDecimal inspectedQty = inspections.stream()
                .map(inspection -> inspection.getInspectedQty() == null ? BigDecimal.ZERO : inspection.getInspectedQty())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (inspectedQty.compareTo(wo.getQtyToProduce()) < 0) {
            throw new IllegalStateException("Passed inspection quantity " + inspectedQty
                    + " is insufficient for Work Order completion quantity " + wo.getQtyToProduce());
        }

        String previousStatus = wo.getStatus();
        wo.setStatus("COMPLETED");
        wo.setProducedQty(wo.getQtyToProduce());
        wo.setActualEndDate(java.time.ZonedDateTime.now());
        if (wo.getActualStartDate() == null) {
            wo.setActualStartDate(wo.getActualEndDate());
        }
        recordTransition(workOrderId, previousStatus, "COMPLETED", "COMPLETE");
        WorkOrder saved = workOrderRepository.save(wo);

        InventoryMovement movement = new InventoryMovement();
        movement.setItemCode(wo.getProductionItem());
        movement.setWarehouseId(wo.getFgWarehouse());
        movement.setQuantity(wo.getQtyToProduce());
        movement.setMovementType("FINISHED_GOODS");
        movement.setWorkOrderId(workOrderId);
        movement.setSourceReference(sourceReference);
        inventoryMovementRepository.save(movement);
        return saved;
    }

    private void recordTransition(String entityId, String fromStatus, String toStatus, String action) {
        StateTransitionAudit audit = new StateTransitionAudit();
        audit.setEntityType("WORK_ORDER");
        audit.setEntityId(entityId);
        audit.setFromStatus(fromStatus);
        audit.setToStatus(toStatus);
        audit.setAction(action);
        stateTransitionAuditRepository.save(audit);
    }

    /**
     * Check if all child sub-assembly Work Orders are completed, auto-updating status.
     */
    @Transactional
    public void checkAndUpdateParentWOStatus(String parentWoId) {
        if (parentWoId == null) return;

        List<WorkOrder> children = workOrderRepository.findByParentWoId(parentWoId);
        boolean allChildrenCompleted = children.stream().allMatch(c -> "COMPLETED".equalsIgnoreCase(c.getStatus()));

        if (allChildrenCompleted) {
            WorkOrder parent = workOrderRepository.findByIdForUpdate(parentWoId).orElse(null);
            if (parent != null && "NOT_STARTED".equals(parent.getStatus())) {
                parent.setStatus("IN_PROGRESS");
                workOrderRepository.save(parent);
            }
        }
    }
}
