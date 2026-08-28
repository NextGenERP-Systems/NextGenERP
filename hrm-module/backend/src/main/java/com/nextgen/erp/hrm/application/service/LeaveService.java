package com.nextgen.erp.hrm.application.service;

import com.nextgen.erp.hrm.domain.model.Employee;
import com.nextgen.erp.hrm.domain.model.Enums.LeaveStatus;
import com.nextgen.erp.hrm.domain.model.LeaveAllocation;
import com.nextgen.erp.hrm.domain.model.LeaveApplication;
import com.nextgen.erp.hrm.domain.model.LeaveType;
import com.nextgen.erp.hrm.infrastructure.repository.EmployeeRepository;
import com.nextgen.erp.hrm.infrastructure.repository.LeaveAllocationRepository;
import com.nextgen.erp.hrm.infrastructure.repository.LeaveApplicationRepository;
import com.nextgen.erp.hrm.infrastructure.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveApplicationRepository leaveApplicationRepository;
    private final LeaveAllocationRepository leaveAllocationRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<LeaveApplication> getAllApplications() {
        return leaveApplicationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<LeaveType> getAllLeaveTypes() {
        return leaveTypeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<LeaveAllocation> getEmployeeAllocations(UUID employeeId, Integer fiscalYear) {
        int year = (fiscalYear != null) ? fiscalYear : java.time.LocalDate.now().getYear();
        return leaveAllocationRepository.findByEmployeeIdAndFiscalYear(employeeId, year);
    }

    @Transactional
    public LeaveApplication applyLeave(LeaveApplication application) {
        if (application.getApplicationNumber() == null || application.getApplicationNumber().isBlank()) {
            long count = leaveApplicationRepository.count() + 1;
            application.setApplicationNumber(String.format("LA-%d-%04d", java.time.LocalDate.now().getYear(), count));
        }
        application.setStatus(LeaveStatus.PENDING);
        return leaveApplicationRepository.save(application);
    }

    @Transactional
    public LeaveApplication approveLeave(UUID applicationId, UUID approverId) {
        LeaveApplication app = leaveApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Leave application not found: " + applicationId));

        if (app.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalStateException("Only PENDING leave applications can be approved.");
        }

        app.setStatus(LeaveStatus.APPROVED);
        app.setApprovedAt(OffsetDateTime.now());
        if (approverId != null) {
            employeeRepository.findById(approverId).ifPresent(app::setApprovedBy);
        }

        // Deduct from allocation if exists
        int currentYear = app.getFromDate().getYear();
        Optional<LeaveAllocation> allocationOpt = leaveAllocationRepository
                .findByEmployeeIdAndLeaveTypeIdAndFiscalYear(app.getEmployee().getId(), app.getLeaveType().getId(), currentYear);

        allocationOpt.ifPresent(alloc -> {
            alloc.setUsedLeaves(alloc.getUsedLeaves().add(app.getTotalLeaveDays()));
            alloc.setRemainingLeaves(alloc.getTotalAllocated().subtract(alloc.getUsedLeaves()));
            leaveAllocationRepository.save(alloc);
        });

        return leaveApplicationRepository.save(app);
    }

    @Transactional
    public LeaveApplication rejectLeave(UUID applicationId, String rejectionReason) {
        LeaveApplication app = leaveApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Leave application not found: " + applicationId));

        app.setStatus(LeaveStatus.REJECTED);
        app.setRejectionReason(rejectionReason);
        return leaveApplicationRepository.save(app);
    }
}
