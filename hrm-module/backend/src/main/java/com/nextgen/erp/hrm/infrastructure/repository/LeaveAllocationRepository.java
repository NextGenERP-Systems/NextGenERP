package com.nextgen.erp.hrm.infrastructure.repository;

import com.nextgen.erp.hrm.domain.model.LeaveAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveAllocationRepository extends JpaRepository<LeaveAllocation, UUID> {
    List<LeaveAllocation> findByEmployeeIdAndFiscalYear(UUID employeeId, Integer fiscalYear);
    Optional<LeaveAllocation> findByEmployeeIdAndLeaveTypeIdAndFiscalYear(UUID employeeId, UUID leaveTypeId, Integer fiscalYear);
}
