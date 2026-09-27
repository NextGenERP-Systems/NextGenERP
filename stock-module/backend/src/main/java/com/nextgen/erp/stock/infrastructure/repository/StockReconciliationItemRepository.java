package com.nextgen.erp.stock.infrastructure.repository;

import com.nextgen.erp.stock.domain.model.StockReconciliationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockReconciliationItemRepository extends JpaRepository<StockReconciliationItem, String> {
    List<StockReconciliationItem> findByReconciliationId(String reconciliationId);
}
