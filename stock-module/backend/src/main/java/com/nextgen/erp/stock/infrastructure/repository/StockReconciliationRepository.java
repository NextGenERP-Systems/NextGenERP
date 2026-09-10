package com.nextgen.erp.stock.infrastructure.repository;

import com.nextgen.erp.stock.domain.model.StockReconciliation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StockReconciliationRepository extends JpaRepository<StockReconciliation, String> {
    Optional<StockReconciliation> findByReconciliationNumber(String reconciliationNumber);
}
