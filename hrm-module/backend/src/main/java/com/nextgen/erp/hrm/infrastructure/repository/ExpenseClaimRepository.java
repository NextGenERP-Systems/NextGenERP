package com.nextgen.erp.hrm.infrastructure.repository;

import com.nextgen.erp.hrm.domain.model.Enums.ExpenseStatus;
import com.nextgen.erp.hrm.domain.model.ExpenseClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpenseClaimRepository extends JpaRepository<ExpenseClaim, UUID> {
    Optional<ExpenseClaim> findByClaimNumber(String claimNumber);
    List<ExpenseClaim> findByEmployeeIdOrderByClaimDateDesc(UUID employeeId);
    List<ExpenseClaim> findByStatus(ExpenseStatus status);
}
