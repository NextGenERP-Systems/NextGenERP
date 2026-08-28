package com.nextgen.erp.hrm.infrastructure.repository;

import com.nextgen.erp.hrm.domain.model.EmployeeAppraisal;
import com.nextgen.erp.hrm.domain.model.Enums.AppraisalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeAppraisalRepository extends JpaRepository<EmployeeAppraisal, UUID> {
    List<EmployeeAppraisal> findByEmployeeId(UUID employeeId);
    List<EmployeeAppraisal> findByStatus(AppraisalStatus status);
}
