package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.MockStockLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.UUID;

@Repository
public interface MockStockLedgerRepository extends JpaRepository<MockStockLedger, UUID> {

    @Query("SELECT COALESCE(SUM(s.actualQty), 0.0000) FROM MockStockLedger s WHERE LOWER(s.itemCode) = LOWER(:itemCode)")
    BigDecimal findTotalStockByItemCode(@Param("itemCode") String itemCode);

    @Query("SELECT COALESCE(SUM(s.actualQty), 0.0000) FROM MockStockLedger s WHERE LOWER(s.itemCode) = LOWER(:itemCode) AND LOWER(s.warehouseId) = LOWER(:warehouseId)")
    BigDecimal findStockByItemCodeAndWarehouse(@Param("itemCode") String itemCode, @Param("warehouseId") String warehouseId);
}
