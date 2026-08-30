package com.nextgen.erp.accounting.presentation.controller;

import com.nextgen.erp.accounting.application.service.BankingService;
import com.nextgen.erp.accounting.domain.model.BankAccount;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/banking")
@RequiredArgsConstructor
@Tag(name = "Banking & Accounts", description = "Endpoints for bank accounts, deposits, and statement reconciliation")
public class BankingController {

    private final BankingService bankingService;

    @GetMapping("/accounts")
    @Operation(summary = "Get all Bank Accounts")
    public ResponseEntity<List<BankAccount>> getAllBankAccounts() {
        return ResponseEntity.ok(bankingService.getAllBankAccounts());
    }

    @GetMapping("/accounts/{id}")
    @Operation(summary = "Get Bank Account by UUID")
    public ResponseEntity<BankAccount> getBankAccountById(@PathVariable UUID id) {
        return bankingService.getBankAccountById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/accounts")
    @Operation(summary = "Create a new Bank Account")
    public ResponseEntity<BankAccount> createBankAccount(@RequestBody BankAccount account) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bankingService.createBankAccount(account));
    }

    @DeleteMapping("/accounts/{id}")
    @Operation(summary = "Delete Bank Account by UUID")
    public ResponseEntity<Void> deleteBankAccount(@PathVariable UUID id) {
        bankingService.deleteBankAccount(id);
        return ResponseEntity.noContent().build();
    }
}
