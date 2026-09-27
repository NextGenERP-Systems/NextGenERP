package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.PurchaseRequisition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseRequisitionRepository extends JpaRepository<PurchaseRequisition, UUID> {
    List<PurchaseRequisition> findBySalesOrderIdOrderByCreatedAtDesc(UUID salesOrderId);
    List<PurchaseRequisition> findAllByOrderByCreatedAtDesc();

    @Query("SELECT pr FROM PurchaseRequisition pr LEFT JOIN FETCH pr.items WHERE pr.id = :id")
    Optional<PurchaseRequisition> findByIdWithItems(@Param("id") UUID id);
}
