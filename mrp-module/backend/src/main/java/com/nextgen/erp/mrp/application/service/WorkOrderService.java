package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.*;
import com.nextgen.erp.mrp.domain.repository.BomRepository;
import com.nextgen.erp.mrp.domain.repository.JobCardRepository;
import com.nextgen.erp.mrp.domain.repository.MockItemRepository;
import com.nextgen.erp.mrp.domain.repository.RoutingRepository;
import com.nextgen.erp.mrp.domain.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final BomRepository bomRepository;
    private final RoutingRepository routingRepository;
    private final JobCardRepository jobCardRepository;
    private final MockItemRepository mockItemRepository;

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
        if (wo.getWorkOrderId() == null || wo.getWorkOrderId().isBlank()) {
            wo.setWorkOrderId("WO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (wo.getStatus() == null || wo.getStatus().isBlank()) {
            wo.setStatus("NOT_STARTED");
        }
        if (wo.getProducedQty() == null) {
            wo.setProducedQty(BigDecimal.ZERO);
        }

        // Auto-create missing MockItem for productionItem to prevent FK constraint failure
        if (wo.getProductionItem() != null && !wo.getProductionItem().isBlank()) {
            if (!mockItemRepository.existsById(wo.getProductionItem())) {
                MockItem item = new MockItem();
                item.setItemCode(wo.getProductionItem());
                item.setItemName(wo.getItemName() != null ? wo.getItemName() : wo.getProductionItem());
                item.setItemGroup("Products");
                item.setUom("Nos");
                item.setStandardRate(BigDecimal.ZERO);
                item.setIsStockItem(true);
                mockItemRepository.saveAndFlush(item);
            }
        }

        // Auto-create missing Bom if provided to prevent FK constraint failure
        if (wo.getBomNo() != null && !wo.getBomNo().isBlank()) {
            if (!bomRepository.existsById(wo.getBomNo())) {
                Bom bom = new Bom();
                bom.setBomNo(wo.getBomNo());
                bom.setItemCode(wo.getProductionItem() != null ? wo.getProductionItem() : "GENERIC-ITEM");
                bom.setItemName(wo.getItemName() != null ? wo.getItemName() : "Generic Item");
                bom.setQuantity(BigDecimal.ONE);
                bom.setUom("Nos");
                bom.setIsActive(true);
                bom.setIsDefault(true);
                bom.setRevisionNumber(1);
                bom.setRawMaterialCost(BigDecimal.ZERO);
                bom.setOperatingCost(BigDecimal.ZERO);
                bom.setScrapCost(BigDecimal.ZERO);
                bom.setTotalCost(BigDecimal.ZERO);
                bomRepository.saveAndFlush(bom);
            }
        }

        List<JobCard> jobCardsToSave = new ArrayList<>();

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
                            item.setStandardRate(bItem.getStandardRate());
                            woItems.add(item);
                        }
                    }
                    wo.setItems(woItems);
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
                                woOp.setWorkstationId(rOp.getWorkstationId() != null ? rOp.getWorkstationId() : "WS-ASM-01");
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

        WorkOrder savedWo = workOrderRepository.saveAndFlush(wo);
        if (!jobCardsToSave.isEmpty()) {
            jobCardRepository.saveAll(jobCardsToSave);
        }
        return savedWo;
    }

    @Transactional
    public WorkOrder submitWorkOrder(String workOrderId) {
        WorkOrder wo = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work Order not found: " + workOrderId));

        wo.setStatus("SUBMITTED");
        return workOrderRepository.save(wo);
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

