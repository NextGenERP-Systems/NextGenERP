package com.nextgen.erp.hrm.infrastructure.repository;

import com.nextgen.erp.hrm.domain.model.Enums.SalarySlipStatus;
import com.nextgen.erp.hrm.domain.model.SalarySlip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalarySlipRepository extends JpaRepository<SalarySlip, UUID> {
    Optional<SalarySlip> findBySlipNumber(String slipNumber);
    List<SalarySlip> findByEmployeeIdOrderByPostingDateDesc(UUID employeeId);
    List<SalarySlip> findByStartDateAndEndDate(LocalDate startDate, LocalDate endDate);
    List<SalarySlip> findByStatus(SalarySlipStatus status);

    @Query("SELECT SUM(s.grossPay) FROM SalarySlip s WHERE s.status = 'PAID' OR s.status = 'SUBMITTED'")
    BigDecimal sumTotalPayrollDisbursed();
}
