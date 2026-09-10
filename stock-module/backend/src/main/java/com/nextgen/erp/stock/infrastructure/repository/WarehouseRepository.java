package com.nextgen.erp.stock.infrastructure.repository;

import com.nextgen.erp.stock.domain.model.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, String> {
    Optional<Warehouse> findByWarehouseName(String warehouseName);
    List<Warehouse> findByParentWarehouseId(String parentWarehouseId);
    List<Warehouse> findByIsDisabledFalse();
}
