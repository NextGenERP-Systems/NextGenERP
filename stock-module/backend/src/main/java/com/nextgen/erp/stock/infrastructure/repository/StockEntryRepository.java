package com.nextgen.erp.stock.infrastructure.repository;

import com.nextgen.erp.stock.domain.model.StockEntry;
import com.nextgen.erp.stock.domain.model.StockEntryPurpose;
import com.nextgen.erp.stock.domain.model.StockEntryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockEntryRepository extends JpaRepository<StockEntry, String> {
    Optional<StockEntry> findByEntryNumber(String entryNumber);
    List<StockEntry> findByStatus(StockEntryStatus status);
    List<StockEntry> findByPurpose(StockEntryPurpose purpose);
}
