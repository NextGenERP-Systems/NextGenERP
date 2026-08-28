package com.nextgen.erp.hrm.application.service;

import com.nextgen.erp.hrm.domain.model.Employee;
import com.nextgen.erp.hrm.domain.model.Enums.ExpenseStatus;
import com.nextgen.erp.hrm.domain.model.ExpenseClaim;
import com.nextgen.erp.hrm.infrastructure.repository.EmployeeRepository;
import com.nextgen.erp.hrm.infrastructure.repository.ExpenseClaimRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExpenseClaimService {

    private final ExpenseClaimRepository expenseClaimRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<ExpenseClaim> getAllExpenseClaims() {
        return expenseClaimRepository.findAll();
    }

    @Transactional
    public ExpenseClaim submitExpenseClaim(ExpenseClaim claim) {
        if (claim.getClaimNumber() == null || claim.getClaimNumber().isBlank()) {
            long count = expenseClaimRepository.count() + 1;
            claim.setClaimNumber(String.format("EXP-2026-%04d", count));
        }
        claim.setStatus(ExpenseStatus.SUBMITTED);
        return expenseClaimRepository.save(claim);
    }

    @Transactional
    public ExpenseClaim approveExpenseClaim(UUID claimId, UUID approverId, BigDecimal sanctionedAmount) {
        ExpenseClaim claim = expenseClaimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Expense claim not found: " + claimId));

        claim.setStatus(ExpenseStatus.APPROVED);
        claim.setSanctionedAmount(sanctionedAmount != null ? sanctionedAmount : claim.getTotalAmount());
        if (approverId != null) {
            employeeRepository.findById(approverId).ifPresent(claim::setApprovedBy);
        }

        return expenseClaimRepository.save(claim);
    }

    @Transactional
    public ExpenseClaim payExpenseClaim(UUID claimId, String paymentReference) {
        ExpenseClaim claim = expenseClaimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Expense claim not found: " + claimId));

        claim.setStatus(ExpenseStatus.PAID);
        claim.setPaymentReference(paymentReference != null ? paymentReference : "BANK-EXP-" + System.currentTimeMillis());
        return expenseClaimRepository.save(claim);
    }
}
