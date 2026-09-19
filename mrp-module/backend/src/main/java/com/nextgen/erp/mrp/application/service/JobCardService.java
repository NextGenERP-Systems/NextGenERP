package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.JobCard;
import com.nextgen.erp.mrp.domain.entity.JobCardTimeLog;
import com.nextgen.erp.mrp.domain.entity.WorkOrder;
import com.nextgen.erp.mrp.domain.repository.JobCardRepository;
import com.nextgen.erp.mrp.domain.repository.WorkOrderRepository;
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
    private final WorkOrderService workOrderService;

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

        jc.setStatus("WORK_IN_PROGRESS");
        jc.setAssignedEmployeeId(employeeId);

        JobCardTimeLog log = new JobCardTimeLog();
        log.setJobCardId(jobCardId);
        log.setEmployeeId(employeeId);
        log.setStartTime(ZonedDateTime.now());
        log.setCompletedQty(BigDecimal.ZERO);

        jc.getTimeLogs().add(log);
        return jobCardRepository.save(jc);
    }

    @Transactional
    public JobCard completeJobCard(String jobCardId, BigDecimal completedQty) {
        return completeJobCard(jobCardId, completedQty, BigDecimal.ZERO, null);
    }

    @Transactional
    public JobCard completeJobCard(String jobCardId, BigDecimal completedQty, BigDecimal scrapQty, String scrapReason) {
        JobCard jc = jobCardRepository.findByIdForUpdate(jobCardId)
                .orElseThrow(() -> new IllegalArgumentException("Job Card not found for lock: " + jobCardId));

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
            jc.setStatus("COMPLETED");
        }

        JobCard savedJc = jobCardRepository.save(jc);

        // Also check parent Work Order status
        WorkOrder wo = workOrderRepository.findById(jc.getWorkOrderId()).orElse(null);
        if (wo != null && wo.getParentWoId() != null) {
            workOrderService.checkAndUpdateParentWOStatus(wo.getParentWoId());
        }

        return savedJc;
    }

    /**
     * Capacity Scheduling Algorithm (MRP II):
     * Schedules a JobCard on its designated workstation avoiding overlapping active schedules.
     */
    @Transactional
    public JobCard scheduleJobCard(String jobCardId, ZonedDateTime startFrom, long durationMins) {
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
