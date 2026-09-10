package com.nextgen.erp.stock.infrastructure.repository;

import com.nextgen.erp.stock.domain.model.SerialNo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SerialNoRepository extends JpaRepository<SerialNo, String> {
    Optional<SerialNo> findBySerialNo(String serialNo);
    List<SerialNo> findByItemId(String itemId);
    List<SerialNo> findByWarehouseId(String warehouseId);
}
