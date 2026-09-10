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

        JobCardTimeLog log = JobCardTimeLog.builder()
                .jobCardId(jobCardId)
                .employeeId(employeeId)
                .startTime(ZonedDateTime.now())
                .completedQty(BigDecimal.ZERO)
                .build();

        jc.getTimeLogs().add(log);
        return jobCardRepository.save(jc);
    }

    @Transactional
    public JobCard completeJobCard(String jobCardId, BigDecimal completedQty) {
        JobCard jc = jobCardRepository.findByIdForUpdate(jobCardId)
                .orElseThrow(() -> new IllegalArgumentException("Job Card not found for lock: " + jobCardId));

        BigDecimal currentDone = jc.getCompletedQuantity() != null ? jc.getCompletedQuantity() : BigDecimal.ZERO;
        BigDecimal newDone = currentDone.add(completedQty);

        if (newDone.compareTo(jc.getForQuantity()) > 0) {
            throw new IllegalArgumentException("Completed quantity (" + newDone + ") exceeds required (" + jc.getForQuantity() + ")");
        }

        jc.setCompletedQuantity(newDone);

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
}
