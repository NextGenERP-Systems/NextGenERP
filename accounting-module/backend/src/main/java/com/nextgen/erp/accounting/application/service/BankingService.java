package com.nextgen.erp.accounting.application.service;

import com.nextgen.erp.accounting.domain.model.BankAccount;
import com.nextgen.erp.accounting.infrastructure.repository.BankAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BankingService {

    private final BankAccountRepository bankAccountRepository;

    @Transactional(readOnly = true)
    public List<BankAccount> getAllBankAccounts() {
        return bankAccountRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<BankAccount> getBankAccountById(UUID id) {
        return bankAccountRepository.findById(id);
    }

    @Transactional
    public BankAccount createBankAccount(BankAccount account) {
        return bankAccountRepository.save(account);
    }

    @Transactional
    public void deleteBankAccount(UUID id) {
        bankAccountRepository.deleteById(id);
    }
}
