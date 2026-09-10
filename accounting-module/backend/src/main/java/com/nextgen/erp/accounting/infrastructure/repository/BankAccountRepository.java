package com.nextgen.erp.accounting.infrastructure.repository;

import com.nextgen.erp.accounting.domain.model.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, UUID> {
    Optional<BankAccount> findByAccountNumber(String accountNumber);
}
