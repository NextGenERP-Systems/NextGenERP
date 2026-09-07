package com.nextgen.erp.projects.application.service;

import com.nextgen.erp.projects.domain.model.Project;
import com.nextgen.erp.projects.domain.model.Timesheet;
import com.nextgen.erp.projects.domain.model.TimesheetDetail;
import com.nextgen.erp.projects.domain.model.ActivityCost;
import com.nextgen.erp.projects.domain.model.ActivityType;
import com.nextgen.erp.projects.infrastructure.repository.ActivityCostRepository;
import com.nextgen.erp.projects.infrastructure.repository.ActivityTypeRepository;
import com.nextgen.erp.projects.infrastructure.repository.ProjectRepository;
import com.nextgen.erp.projects.infrastructure.repository.TimesheetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TimesheetService {

    private final TimesheetRepository timesheetRepository;
    private final ProjectRepository projectRepository;
    private final ActivityCostRepository activityCostRepository;
    private final ActivityTypeRepository activityTypeRepository;

    @Transactional(readOnly = true)
    public List<Timesheet> getTimesheetsByProjectId(UUID projectId) {
        return timesheetRepository.findByProject_Id(projectId);
    }
    
    @Transactional(readOnly = true)
    public List<Timesheet> getAllTimesheets() {
        return timesheetRepository.findAll();
    }

    @Transactional
    public Timesheet createTimesheet(Timesheet timesheet) {
        Project project = projectRepository.findById(timesheet.getProject().getId())
            .orElseThrow(() -> new RuntimeException("Project not found"));
        timesheet.setProject(project);
        
        // Link bidirectional mapping
        if (timesheet.getTimeLogs() != null) {
            for (TimesheetDetail log : timesheet.getTimeLogs()) {
                log.setTimesheet(timesheet);
                resolveRates(timesheet.getUserId(), log);
                // Calculate amounts based on hours and rates
                if (log.getHours() != null) {
                    if (log.getBillingRate() != null) {
                        log.setBillingAmount(log.getHours().multiply(log.getBillingRate()));
                    }
                    if (log.getCostingRate() != null) {
                        log.setCostingAmount(log.getHours().multiply(log.getCostingRate()));
                    }
                }
            }
        }
        
        calculateTotals(timesheet);
        Timesheet saved = timesheetRepository.save(timesheet);
        
        updateProjectFinancials(project);
        
        return saved;
    }

    @Transactional
    public Timesheet updateTimesheet(UUID id, Timesheet details) {
        Timesheet timesheet = timesheetRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Timesheet not found"));
            
        timesheet.setStatus(details.getStatus());
        timesheet.getTimeLogs().clear();
        if (details.getTimeLogs() != null) {
            for (TimesheetDetail log : details.getTimeLogs()) {
                log.setTimesheet(timesheet);
                resolveRates(timesheet.getUserId(), log);
                if (log.getHours() != null) {
                    if (log.getBillingRate() != null) {
                        log.setBillingAmount(log.getHours().multiply(log.getBillingRate()));
                    }
                    if (log.getCostingRate() != null) {
                        log.setCostingAmount(log.getHours().multiply(log.getCostingRate()));
                    }
                }
                timesheet.getTimeLogs().add(log);
            }
        }
        
        calculateTotals(timesheet);
        Timesheet saved = timesheetRepository.save(timesheet);
        
        updateProjectFinancials(timesheet.getProject());
        return saved;
    }

    private void resolveRates(UUID employeeId, TimesheetDetail log) {
        if (log.getActivityTypeId() == null) {
            if (log.getCostingRate() == null) log.setCostingRate(BigDecimal.ZERO);
            if (log.getBillingRate() == null) log.setBillingRate(BigDecimal.ZERO);
            return;
        }

        // Only resolve if not explicitly provided (or if we want to force override, we do it here. 
        // Snapshotting means we fetch it here when creating.)
        if (log.getCostingRate() == null || log.getCostingRate().compareTo(BigDecimal.ZERO) == 0 ||
            log.getBillingRate() == null || log.getBillingRate().compareTo(BigDecimal.ZERO) == 0) {
            
            BigDecimal costRate = BigDecimal.ZERO;
            BigDecimal billRate = BigDecimal.ZERO;

            Optional<ActivityCost> costOpt = activityCostRepository.findByEmployeeIdAndActivityType_Id(employeeId, log.getActivityTypeId());
            if (costOpt.isPresent()) {
                costRate = costOpt.get().getCostingRate();
                billRate = costOpt.get().getBillingRate();
            } else {
                Optional<ActivityType> typeOpt = activityTypeRepository.findById(log.getActivityTypeId());
                if (typeOpt.isPresent()) {
                    costRate = typeOpt.get().getDefaultCostingRate();
                    billRate = typeOpt.get().getDefaultBillingRate();
                }
            }

            if (log.getCostingRate() == null || log.getCostingRate().compareTo(BigDecimal.ZERO) == 0) {
                log.setCostingRate(costRate != null ? costRate : BigDecimal.ZERO);
            }
            if (log.getBillingRate() == null || log.getBillingRate().compareTo(BigDecimal.ZERO) == 0) {
                log.setBillingRate(billRate != null ? billRate : BigDecimal.ZERO);
            }
        }
    }
    
    private void calculateTotals(Timesheet timesheet) {
        BigDecimal totalHours = BigDecimal.ZERO;
        BigDecimal totalBillableHours = BigDecimal.ZERO;
        BigDecimal totalBilledAmount = BigDecimal.ZERO;
        BigDecimal totalCostingAmount = BigDecimal.ZERO;
        
        if (timesheet.getTimeLogs() != null) {
            for (TimesheetDetail log : timesheet.getTimeLogs()) {
                if (log.getHours() != null) {
                    totalHours = totalHours.add(log.getHours());
                    if (Boolean.TRUE.equals(log.getIsBillable())) {
                        totalBillableHours = totalBillableHours.add(log.getHours());
                        totalBilledAmount = totalBilledAmount.add(log.getBillingAmount() != null ? log.getBillingAmount() : BigDecimal.ZERO);
                    }
                    totalCostingAmount = totalCostingAmount.add(log.getCostingAmount() != null ? log.getCostingAmount() : BigDecimal.ZERO);
                }
            }
        }
        
        timesheet.setTotalHours(totalHours);
        timesheet.setTotalBillableHours(totalBillableHours);
        timesheet.setTotalBilledAmount(totalBilledAmount);
        timesheet.setTotalCostingAmount(totalCostingAmount);
    }
    
    private void updateProjectFinancials(Project project) {
        List<Timesheet> projectTimesheets = timesheetRepository.findByProject_Id(project.getId());
        
        BigDecimal totalBillable = BigDecimal.ZERO;
        BigDecimal totalCosting = BigDecimal.ZERO;
        
        for (Timesheet ts : projectTimesheets) {
            totalBillable = totalBillable.add(ts.getTotalBilledAmount() != null ? ts.getTotalBilledAmount() : BigDecimal.ZERO);
            totalCosting = totalCosting.add(ts.getTotalCostingAmount() != null ? ts.getTotalCostingAmount() : BigDecimal.ZERO);
        }
        
        project.setTotalBillableAmount(totalBillable);
        project.setTotalCostingAmount(totalCosting);
        
        if (project.getTotalBillableAmount() != null && project.getTotalCostingAmount() != null) {
            project.setGrossMargin(project.getTotalBillableAmount().subtract(project.getTotalCostingAmount()));
        }
        
        projectRepository.save(project);
    }
}
