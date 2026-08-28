package com.nextgen.erp.hrm.application.service;

import com.nextgen.erp.hrm.domain.model.Employee;
import com.nextgen.erp.hrm.domain.model.ExpenseClaim;
import com.nextgen.erp.hrm.infrastructure.repository.EmployeeRepository;
import com.nextgen.erp.hrm.infrastructure.repository.ExpenseClaimRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HrmSalesIntegrationService {

    private final EmployeeRepository employeeRepository;
    private final ExpenseClaimRepository expenseClaimRepository;

    @Data
    @Builder
    public static class SalesEmployeeDto {
        private UUID id;
        private String employeeCode;
        private String fullName;
        private String workEmail;
        private String cellNumber;
        private String departmentName;
        private String designationName;
        private String status;
    }

    @Data
    @Builder
    public static class CustomerExpenseSummaryDto {
        private UUID customerId;
        private String customerName;
        private BigDecimal totalExpenseAmount;
        private int totalClaimsCount;
        private List<ExpenseClaimItemDto> claims;
    }

    @Data
    @Builder
    public static class ExpenseClaimItemDto {
        private UUID id;
        private String claimNumber;
        private String employeeName;
        private String expenseType;
        private BigDecimal amount;
        private String claimDate;
        private String status;
        private String salesOrderId;
        private Boolean isBillable;
    }

    /**
     * Retrieve all active employees in Sales, Marketing, and Business Development departments
     */
    @Transactional(readOnly = true)
    public List<SalesEmployeeDto> getSalesEmployees() {
        return employeeRepository.findAll().stream()
                .filter(e -> {
                    String dept = e.getDepartment() != null ? e.getDepartment().getDepartmentName().toLowerCase() : "";
                    String desg = e.getDesignation() != null ? e.getDesignation().getDesignationName().toLowerCase() : "";
                    return dept.contains("sales") || dept.contains("business") || desg.contains("sales") || desg.contains("account");
                })
                .map(e -> SalesEmployeeDto.builder()
                        .id(e.getId())
                        .employeeCode(e.getEmployeeCode())
                        .fullName(e.getFullName())
                        .workEmail(e.getWorkEmail())
                        .cellNumber(e.getCellNumber())
                        .departmentName(e.getDepartment() != null ? e.getDepartment().getDepartmentName() : "Sales")
                        .designationName(e.getDesignation() != null ? e.getDesignation().getDesignationName() : "Sales Representative")
                        .status(e.getStatus().name())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Retrieve all expense claims incurred for a particular customer
     */
    @Transactional(readOnly = true)
    public CustomerExpenseSummaryDto getExpensesForCustomer(String customerName) {
        List<ExpenseClaim> claims = expenseClaimRepository.findAll().stream()
                .filter(c -> c.getCustomerName() != null && c.getCustomerName().equalsIgnoreCase(customerName))
                .collect(Collectors.toList());

        BigDecimal total = claims.stream()
                .map(ExpenseClaim::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ExpenseClaimItemDto> itemDtos = claims.stream()
                .map(c -> ExpenseClaimItemDto.builder()
                        .id(c.getId())
                        .claimNumber(c.getClaimNumber())
                        .employeeName(c.getEmployee() != null ? c.getEmployee().getFullName() : "Employee")
                        .expenseType(c.getExpenseType())
                        .amount(c.getTotalAmount())
                        .claimDate(c.getClaimDate() != null ? c.getClaimDate().toString() : "")
                        .status(c.getStatus().name())
                        .salesOrderId(c.getSalesOrderId())
                        .isBillable(c.getIsBillable())
                        .build())
                .collect(Collectors.toList());

        return CustomerExpenseSummaryDto.builder()
                .customerName(customerName)
                .totalExpenseAmount(total)
                .totalClaimsCount(claims.size())
                .claims(itemDtos)
                .build();
    }
}
