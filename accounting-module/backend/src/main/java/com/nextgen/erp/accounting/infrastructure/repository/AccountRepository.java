package com.nextgen.erp.accounting.infrastructure.repository;

import com.nextgen.erp.accounting.domain.model.Account;
import com.nextgen.erp.accounting.domain.model.Enums.RootType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {
    Optional<Account> findByAccountCode(String accountCode);
    List<Account> findByRootType(RootType rootType);
    List<Account> findByIsGroupFalse();
    List<Account> findByIsActiveTrue();
    List<Account> findByParentAccountId(UUID parentAccountId);
}
