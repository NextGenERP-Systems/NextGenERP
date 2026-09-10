package com.nextgen.erp.stock.infrastructure.repository;

import com.nextgen.erp.stock.domain.model.StockLedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockLedgerEntryRepository extends JpaRepository<StockLedgerEntry, String> {
    List<StockLedgerEntry> findByItemIdOrderByPostingDateAscPostingTimeAsc(String itemId);
    List<StockLedgerEntry> findByWarehouseIdOrderByPostingDateDescPostingTimeDesc(String warehouseId);
    List<StockLedgerEntry> findByVoucherTypeAndVoucherNo(String voucherType, String voucherNo);

    @Query("SELECT s FROM StockLedgerEntry s ORDER BY s.postingDate DESC, s.postingTime DESC")
    List<StockLedgerEntry> findLatestEntries();
}
