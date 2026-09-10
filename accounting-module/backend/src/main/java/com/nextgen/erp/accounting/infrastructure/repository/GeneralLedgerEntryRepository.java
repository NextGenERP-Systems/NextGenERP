package com.nextgen.erp.accounting.infrastructure.repository;

import com.nextgen.erp.accounting.domain.model.Enums.VoucherType;
import com.nextgen.erp.accounting.domain.model.GeneralLedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface GeneralLedgerEntryRepository extends JpaRepository<GeneralLedgerEntry, UUID> {
    List<GeneralLedgerEntry> findByAccountIdOrderByPostingDateAscCreatedAtAsc(UUID accountId);
    List<GeneralLedgerEntry> findByVoucherTypeAndVoucherNumber(VoucherType voucherType, String voucherNumber);
    List<GeneralLedgerEntry> findByPostingDateBetweenOrderByPostingDateAsc(LocalDate fromDate, LocalDate toDate);
    List<GeneralLedgerEntry> findAllByOrderByPostingDateDescCreatedAtDesc();

    @Query("SELECT g FROM GeneralLedgerEntry g WHERE g.account.id = :accountId AND g.postingDate <= :asOfDate AND g.isCancelled = false")
    List<GeneralLedgerEntry> findActiveEntriesForAccountAsOf(@Param("accountId") UUID accountId, @Param("asOfDate") LocalDate asOfDate);
}
