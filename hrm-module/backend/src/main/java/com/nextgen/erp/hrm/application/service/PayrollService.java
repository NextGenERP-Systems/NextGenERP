package com.nextgen.erp.hrm.application.service;

import com.nextgen.erp.hrm.domain.engine.PayrollEngine;
import com.nextgen.erp.hrm.domain.model.Employee;
import com.nextgen.erp.hrm.domain.model.Enums.SalarySlipStatus;
import com.nextgen.erp.hrm.domain.model.SalarySlip;
import com.nextgen.erp.hrm.domain.model.SalaryStructureAssignment;
import com.nextgen.erp.hrm.infrastructure.repository.EmployeeRepository;
import com.nextgen.erp.hrm.infrastructure.repository.SalarySlipRepository;
import com.nextgen.erp.hrm.infrastructure.repository.SalaryStructureAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final SalarySlipRepository salarySlipRepository;
    private final SalaryStructureAssignmentRepository assignmentRepository;
    private final EmployeeRepository employeeRepository;
    private final PayrollEngine payrollEngine;

    @Transactional(readOnly = true)
    public List<SalarySlip> getAllSalarySlips() {
        return salarySlipRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<SalarySlip> getSalarySlipById(UUID id) {
        return salarySlipRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<SalarySlip> getEmployeeSalarySlips(UUID employeeId) {
        return salarySlipRepository.findByEmployeeIdOrderByPostingDateDesc(employeeId);
    }

    /**
     * Batch process monthly payroll for all active employees with assigned salary structures
     */
    @Transactional
    public List<SalarySlip> generateBatchPayroll(LocalDate startDate, LocalDate endDate, LocalDate postingDate) {
        List<SalaryStructureAssignment> assignments = assignmentRepository.findByIsActiveTrue();
        List<SalarySlip> generatedSlips = new ArrayList<>();

        if (assignments.isEmpty()) {
            List<Employee> activeEmployees = employeeRepository.findAll();
            for (Employee emp : activeEmployees) {
                BigDecimal baseGross = BigDecimal.valueOf(150000.00);
                BigDecimal workingDays = BigDecimal.valueOf(30);
                BigDecimal paymentDays = BigDecimal.valueOf(30);

                PayrollEngine.ComputedSalaryResult computed = payrollEngine.computeSalary(baseGross, workingDays, paymentDays);

                long count = salarySlipRepository.count() + generatedSlips.size() + 1;
                String slipNumber = String.format("SLIP-%d-%02d-%03d", startDate.getYear(), startDate.getMonthValue(), count);

                SalarySlip slip = SalarySlip.builder()
                        .slipNumber(slipNumber)
                        .employee(emp)
                        .startDate(startDate)
                        .endDate(endDate)
                        .postingDate(postingDate != null ? postingDate : endDate)
                        .totalWorkingDays(workingDays)
                        .paymentDays(paymentDays)
                        .grossPay(computed.grossPay)
                        .totalDeductions(computed.totalDeductions)
                        .netPay(computed.netPay)
                        .roundedTotal(computed.roundedTotal)
                        .inWords(computed.inWords)
                        .status(SalarySlipStatus.DRAFT)
                        .bankAccountNumber(emp.getBankAccountNumber() != null ? emp.getBankAccountNumber() : "5010099887766")
                        .build();

                for (var item : computed.items) {
                    slip.addItem(item);
                }

                generatedSlips.add(salarySlipRepository.save(slip));
            }
            return generatedSlips;
        }

        for (SalaryStructureAssignment assignment : assignments) {
            Employee emp = assignment.getEmployee();
            BigDecimal baseGross = assignment.getBaseGrossPay();
            BigDecimal workingDays = BigDecimal.valueOf(30);
            BigDecimal paymentDays = BigDecimal.valueOf(30);

            PayrollEngine.ComputedSalaryResult computed = payrollEngine.computeSalary(baseGross, workingDays, paymentDays);

            long count = salarySlipRepository.count() + generatedSlips.size() + 1;
            String slipNumber = String.format("SLIP-%d-%02d-%03d", startDate.getYear(), startDate.getMonthValue(), count);

            SalarySlip slip = SalarySlip.builder()
                    .slipNumber(slipNumber)
                    .employee(emp)
                    .startDate(startDate)
                    .endDate(endDate)
                    .postingDate(postingDate != null ? postingDate : endDate)
                    .totalWorkingDays(workingDays)
                    .paymentDays(paymentDays)
                    .grossPay(computed.grossPay)
                    .totalDeductions(computed.totalDeductions)
                    .netPay(computed.netPay)
                    .roundedTotal(computed.roundedTotal)
                    .inWords(computed.inWords)
                    .status(SalarySlipStatus.DRAFT)
                    .bankAccountNumber(emp.getBankAccountNumber() != null ? emp.getBankAccountNumber() : "5010099887766")
                    .build();

            for (var item : computed.items) {
                slip.addItem(item);
            }

            generatedSlips.add(salarySlipRepository.save(slip));
        }

        return generatedSlips;
    }

    @Transactional
    public SalarySlip submitSalarySlip(UUID slipId) {
        SalarySlip slip = salarySlipRepository.findById(slipId)
                .orElseThrow(() -> new IllegalArgumentException("Salary slip not found: " + slipId));
        slip.setStatus(SalarySlipStatus.SUBMITTED);
        return salarySlipRepository.save(slip);
    }

    @Transactional
    public SalarySlip paySalarySlip(UUID slipId, String paymentReference) {
        SalarySlip slip = salarySlipRepository.findById(slipId)
                .orElseThrow(() -> new IllegalArgumentException("Salary slip not found: " + slipId));
        slip.setStatus(SalarySlipStatus.PAID);
        slip.setPaymentReference(paymentReference != null ? paymentReference : "NEFT-TXN-" + System.currentTimeMillis());
        return salarySlipRepository.save(slip);
    }
}
