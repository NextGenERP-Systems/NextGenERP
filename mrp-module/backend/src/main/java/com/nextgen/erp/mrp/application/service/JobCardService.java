package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.JobCard;
import com.nextgen.erp.mrp.domain.entity.JobCardTimeLog;
import com.nextgen.erp.mrp.domain.entity.WorkOrder;
import com.nextgen.erp.mrp.domain.entity.WorkOrderOperation;
import com.nextgen.erp.mrp.domain.repository.JobCardRepository;
import com.nextgen.erp.mrp.domain.repository.QualityInspectionRepository;
import com.nextgen.erp.mrp.domain.repository.WorkOrderRepository;
import com.nextgen.erp.mrp.domain.repository.WorkOrderOperationRepository;
import com.nextgen.erp.mrp.domain.repository.InventoryMovementRepository;
import com.nextgen.erp.mrp.domain.repository.StateTransitionAuditRepository;
import com.nextgen.erp.mrp.domain.entity.StateTransitionAudit;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobCardService {

    private final JobCardRepository jobCardRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderOperationRepository workOrderOperationRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final WorkOrderService workOrderService;
    private final QualityInspectionRepository qualityInspectionRepository;
    private final StateTransitionAuditRepository stateTransitionAuditRepository;

    @Transactional(readOnly = true)
    public List<JobCard> getAllJobCards() {
        return jobCardRepository.findAll();
    }

    @Transactional(readOnly = true)
    public JobCard getJobCardById(String id) {
        return jobCardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job Card not found: " + id));
    }

    @Transactional
    public JobCard startJobCard(String jobCardId, String employeeId) {
        JobCard jc = jobCardRepository.findByIdForUpdate(jobCardId)
                .orElseThrow(() -> new IllegalArgumentException("Job Card not found for lock: " + jobCardId));

        if ("WORK_IN_PROGRESS".equalsIgnoreCase(jc.getStatus())) {
            return jc;
        }
        if (!"OPEN".equalsIgnoreCase(jc.getStatus())) {
            throw new IllegalStateException("Job Card " + jobCardId + " cannot start from status " + jc.getStatus());
        }
        if (employeeId == null || employeeId.isBlank()) {
            throw new IllegalArgumentException("Employee is required to start a Job Card");
        }
        if (jc.getTimeLogs().stream().anyMatch(log -> log.getEndTime() == null)) {
            throw new IllegalStateException("Job Card " + jobCardId + " already has an active time log");
        }

        String previousStatus = jc.getStatus();
        jc.setStatus("WORK_IN_PROGRESS");
        recordTransition(jobCardId, previousStatus, "WORK_IN_PROGRESS", "START");
        jc.setAssignedEmployeeId(employeeId);

        JobCardTimeLog log = new JobCardTimeLog();
        log.setJobCardId(jobCardId);
        log.setEmployeeId(employeeId);
        log.setStartTime(ZonedDateTime.now());
        log.setCompletedQty(BigDecimal.ZERO);

        jc.getTimeLogs().add(log);
        WorkOrder workOrder = workOrderRepository.findById(jc.getWorkOrderId()).orElse(null);
        if (workOrder != null && workOrder.getItems() != null) {
            for (var item : workOrder.getItems()) {
                String sourceReference = "JC-ISSUE-WIP:" + jobCardId + ":" + item.getItemCode();
                if (inventoryMovementRepository.findBySourceReference(sourceReference).isEmpty()) {
                    var movement = new com.nextgen.erp.mrp.domain.entity.InventoryMovement();
                    movement.setItemCode(item.getItemCode());
                    movement.setWarehouseId(workOrder.getWipWarehouse());
                    movement.setQuantity(item.getRequiredQty());
                    movement.setMovementType("ISSUE_TO_WIP");
                    movement.setWorkOrderId(workOrder.getWorkOrderId());
                    movement.setSourceReference(sourceReference);
                    inventoryMovementRepository.save(movement);
                }
            }
        }
        return jobCardRepository.save(jc);
    }

    @Transactional
    public JobCard completeJobCard(String jobCardId, BigDecimal completedQty) {
        return completeJobCard(jobCardId, completedQty, BigDecimal.ZERO, null);
    }

    @Transactional
    public JobCard completeJobCard(String jobCardId, BigDecimal completedQty, BigDecimal scrapQty, String scrapReason) {
        if (completedQty == null || completedQty.signum() <= 0) {
            throw new IllegalArgumentException("Completed quantity must be greater than zero");
        }
        if (scrapQty != null && scrapQty.signum() < 0) {
            throw new IllegalArgumentException("Scrap quantity cannot be negative");
        }
        JobCard jc = jobCardRepository.findByIdForUpdate(jobCardId)
                .orElseThrow(() -> new IllegalArgumentException("Job Card not found for lock: " + jobCardId));

        if ("COMPLETED".equalsIgnoreCase(jc.getStatus())) {
            return jc;
        }

        BigDecimal currentDone = jc.getCompletedQuantity() != null ? jc.getCompletedQuantity() : BigDecimal.ZERO;
        BigDecimal newDone = currentDone.add(completedQty != null ? completedQty : BigDecimal.ZERO);

        if (newDone.compareTo(jc.getForQuantity()) > 0) {
            throw new IllegalArgumentException("Completed quantity (" + newDone + ") exceeds required (" + jc.getForQuantity() + ")");
        }

        jc.setCompletedQuantity(newDone);

        if (scrapQty != null && scrapQty.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal currentScrap = jc.getScrapQuantity() != null ? jc.getScrapQuantity() : BigDecimal.ZERO;
            jc.setScrapQuantity(currentScrap.add(scrapQty));
            if (scrapReason != null && !scrapReason.isBlank()) {
                jc.setScrapReason(scrapReason);
            }
            String scrapReference = "JC-SCRAP:" + jobCardId + ":" + newDone;
            if (inventoryMovementRepository.findBySourceReference(scrapReference).isEmpty()) {
                WorkOrder workOrder = workOrderRepository.findById(jc.getWorkOrderId()).orElse(null);
                var scrapMovement = new com.nextgen.erp.mrp.domain.entity.InventoryMovement();
                scrapMovement.setItemCode(workOrder != null ? workOrder.getProductionItem() : "JOB_CARD_SCRAP");
                scrapMovement.setWarehouseId(workOrder != null ? workOrder.getWipWarehouse() : null);
                scrapMovement.setQuantity(scrapQty);
                scrapMovement.setMovementType("SCRAP");
                scrapMovement.setWorkOrderId(jc.getWorkOrderId());
                scrapMovement.setSourceReference(scrapReference);
                inventoryMovementRepository.save(scrapMovement);
            }
        }

        // Update active time log
        if (!jc.getTimeLogs().isEmpty()) {
            JobCardTimeLog activeLog = jc.getTimeLogs().get(jc.getTimeLogs().size() - 1);
            if (activeLog.getEndTime() == null) {
                activeLog.setEndTime(ZonedDateTime.now());
                activeLog.setCompletedQty(completedQty);
            }
        }

        if (newDone.compareTo(jc.getForQuantity()) >= 0) {
            var inspections = qualityInspectionRepository.findByWorkOrderId(jc.getWorkOrderId());
            if (inspections == null || inspections.isEmpty()
                    || inspections.stream().anyMatch(inspection -> !"PASSED".equalsIgnoreCase(inspection.getStatus()))) {
                throw new IllegalStateException("Quality inspection approval is required before completing Job Card " + jobCardId);
            }
            BigDecimal inspectedQty = inspections.stream()
                    .map(inspection -> inspection.getInspectedQty() == null ? BigDecimal.ZERO : inspection.getInspectedQty())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            if (inspectedQty.compareTo(newDone) < 0) {
                throw new IllegalStateException("Passed inspection quantity " + inspectedQty
                        + " is insufficient for Job Card completion quantity " + newDone);
            }
            String previousStatus = jc.getStatus();
            jc.setStatus("COMPLETED");
            recordTransition(jobCardId, previousStatus, "COMPLETED", "COMPLETE");
        }

        updateLinkedOperationProgress(jc, completedQty, newDone.compareTo(jc.getForQuantity()) >= 0);

        JobCard savedJc = jobCardRepository.save(jc);

        // Also check parent Work Order status
        WorkOrder wo = workOrderRepository.findById(jc.getWorkOrderId()).orElse(null);
        if (wo != null && wo.getParentWoId() != null) {
            workOrderService.checkAndUpdateParentWOStatus(wo.getParentWoId());
        }

        return savedJc;
    }

    private void updateLinkedOperationProgress(JobCard jobCard, BigDecimal completedQty,
                                               boolean completed) {
        if (jobCard.getWorkOrderOperationId() == null) {
            return;
        }
        WorkOrderOperation operation = workOrderOperationRepository.findByIdForUpdate(jobCard.getWorkOrderOperationId())
                .orElseThrow(() -> new IllegalStateException("Linked Work Order operation not found for Job Card "
                        + jobCard.getJobCardId()));
        BigDecimal current = operation.getCompletedQty() == null ? BigDecimal.ZERO : operation.getCompletedQty();
        BigDecimal updated = current.add(completedQty);
        if (updated.compareTo(jobCard.getForQuantity()) > 0) {
            throw new IllegalArgumentException("Operation completed quantity cannot exceed Job Card quantity");
        }
        operation.setCompletedQty(updated);
        operation.setStatus(completed ? "COMPLETED" : "IN_PROGRESS");
        workOrderOperationRepository.save(operation);
    }

    private void recordTransition(String entityId, String fromStatus, String toStatus, String action) {
        StateTransitionAudit audit = new StateTransitionAudit();
        audit.setEntityType("JOB_CARD");
        audit.setEntityId(entityId);
        audit.setFromStatus(fromStatus);
        audit.setToStatus(toStatus);
        audit.setAction(action);
        stateTransitionAuditRepository.save(audit);
    }

    /**
     * Capacity Scheduling Algorithm (MRP II):
     * Schedules a JobCard on its designated workstation avoiding overlapping active schedules.
     */
    @Transactional
    public JobCard scheduleJobCard(String jobCardId, ZonedDateTime startFrom, long durationMins) {
        if (durationMins <= 0) {
            throw new IllegalArgumentException("Job Card duration must be greater than zero");
        }
        JobCard jc = jobCardRepository.findByIdForUpdate(jobCardId)
                .orElseThrow(() -> new IllegalArgumentException("Job Card not found: " + jobCardId));

        ZonedDateTime candidateStart = startFrom != null ? startFrom : ZonedDateTime.now();
        ZonedDateTime candidateEnd = candidateStart.plusMinutes(durationMins);

        List<JobCard> existingWorkstationJobs = jobCardRepository.findAll().stream()
                .filter(j -> j.getWorkstationId().equalsIgnoreCase(jc.getWorkstationId()))
                .filter(j -> !j.getJobCardId().equalsIgnoreCase(jobCardId))
                .filter(j -> !"CANCELLED".equalsIgnoreCase(j.getStatus()))
                .filter(j -> j.getScheduledStartTime() != null && j.getScheduledEndTime() != null)
                .sorted((j1, j2) -> j1.getScheduledStartTime().compareTo(j2.getScheduledStartTime()))
                .toList();

        for (JobCard existing : existingWorkstationJobs) {
            if (candidateStart.isBefore(existing.getScheduledEndTime()) && candidateEnd.isAfter(existing.getScheduledStartTime())) {
                // Overlap detected: push start to end of existing job
                candidateStart = existing.getScheduledEndTime().plusMinutes(5);
                candidateEnd = candidateStart.plusMinutes(durationMins);
            }
        }

        jc.setScheduledStartTime(candidateStart);
        jc.setScheduledEndTime(candidateEnd);
        return jobCardRepository.save(jc);
    }
}
