package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.WorkOrder;
import com.nextgen.erp.mrp.domain.entity.WorkOrderItem;
import com.nextgen.erp.mrp.domain.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;

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

    /**
     * Real-Time Material Consumption API endpoint logic with pessimistic row lock.
     * Updates actual_consumed_qty allowing over-consumption tracking.
     */
    @Transactional
    public WorkOrder logMaterialConsumption(String workOrderId, String itemCode, BigDecimal consumeQty) {
        WorkOrder wo = workOrderRepository.findByIdForUpdate(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work Order not found for lock: " + workOrderId));

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

        return workOrderRepository.save(wo);
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
