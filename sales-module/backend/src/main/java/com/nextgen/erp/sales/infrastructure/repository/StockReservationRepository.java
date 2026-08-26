package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.StockReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockReservationRepository extends JpaRepository<StockReservation, UUID> {
    List<StockReservation> findBySalesOrderId(UUID salesOrderId);
}
