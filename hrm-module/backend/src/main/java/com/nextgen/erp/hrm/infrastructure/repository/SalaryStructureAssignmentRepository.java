package com.nextgen.erp.hrm.infrastructure.repository;

import com.nextgen.erp.hrm.domain.model.SalaryStructureAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalaryStructureAssignmentRepository extends JpaRepository<SalaryStructureAssignment, UUID> {
    Optional<SalaryStructureAssignment> findByEmployeeIdAndIsActiveTrue(UUID employeeId);
    List<SalaryStructureAssignment> findByIsActiveTrue();
}
