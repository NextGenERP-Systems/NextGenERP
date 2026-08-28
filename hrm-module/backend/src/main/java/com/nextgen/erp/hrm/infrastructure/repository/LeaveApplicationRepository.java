package com.nextgen.erp.hrm.infrastructure.repository;

import com.nextgen.erp.hrm.domain.model.Enums.LeaveStatus;
import com.nextgen.erp.hrm.domain.model.LeaveApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, UUID> {
    Optional<LeaveApplication> findByApplicationNumber(String applicationNumber);
    List<LeaveApplication> findByEmployeeIdOrderByCreatedAtDesc(UUID employeeId);
    List<LeaveApplication> findByStatus(LeaveStatus status);
    long countByStatus(LeaveStatus status);
}
