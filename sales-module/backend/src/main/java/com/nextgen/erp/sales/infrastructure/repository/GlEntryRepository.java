package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.GlEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface GlEntryRepository extends JpaRepository<GlEntry, UUID> {
    List<GlEntry> findByVoucherTypeAndVoucherId(String voucherType, UUID voucherId);
    List<GlEntry> findByCustomerIdOrderByPostingDateDesc(UUID customerId);
    List<GlEntry> findAllByOrderByPostingDateDescCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(g.debit - g.credit), 0) FROM GlEntry g WHERE g.account LIKE '1310%' AND g.cancelled = false")
    BigDecimal sumTotalAccountsReceivableBalance();
}
