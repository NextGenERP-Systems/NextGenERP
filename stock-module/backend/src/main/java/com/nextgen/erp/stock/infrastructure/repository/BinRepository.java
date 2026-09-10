package com.nextgen.erp.stock.infrastructure.repository;

import com.nextgen.erp.stock.domain.model.Bin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BinRepository extends JpaRepository<Bin, String> {
    Optional<Bin> findByItemIdAndWarehouseId(String itemId, String warehouseId);
    List<Bin> findByItemId(String itemId);
    List<Bin> findByWarehouseId(String warehouseId);
}
