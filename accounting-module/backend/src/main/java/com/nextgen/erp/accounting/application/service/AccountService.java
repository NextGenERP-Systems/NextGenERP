package com.nextgen.erp.accounting.application.service;

import com.nextgen.erp.accounting.domain.model.Account;
import com.nextgen.erp.accounting.domain.model.Enums.RootType;
import com.nextgen.erp.accounting.infrastructure.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    @Transactional(readOnly = true)
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Account> getAccountById(UUID id) {
        return accountRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Account> getAccountsByRootType(RootType rootType) {
        return accountRepository.findByRootType(rootType);
    }

    @Transactional
    public Account createAccount(Account account) {
        if (account.getBalance() == null) {
            account.setBalance(BigDecimal.ZERO);
        }
        if (account.getAccountCode() == null || account.getAccountCode().isBlank()) {
            long count = accountRepository.count() + 1001;
            account.setAccountCode(String.valueOf(count));
        }
        return accountRepository.save(account);
    }

    @Transactional
    public Account updateAccount(UUID id, Account updated) {
        Account existing = accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + id));
        existing.setAccountName(updated.getAccountName());
        existing.setRootType(updated.getRootType());
        existing.setAccountType(updated.getAccountType());
        existing.setParentAccount(updated.getParentAccount());
        existing.setIsGroup(updated.getIsGroup());
        existing.setIsActive(updated.getIsActive());
        return accountRepository.save(existing);
    }

    @Transactional
    public void deleteAccount(UUID id) {
        accountRepository.deleteById(id);
    }
}
