package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {
    Optional<PurchaseOrder> findByPoNumber(String poNumber);
    List<PurchaseOrder> findBySupplierName(String supplierName);
    List<PurchaseOrder> findByStatus(PurchaseOrder.PurchaseOrderStatus status);
    List<PurchaseOrder> findAllByOrderByCreatedAtDesc();

    @Query("SELECT po FROM PurchaseOrder po LEFT JOIN FETCH po.items WHERE po.id = :id")
    Optional<PurchaseOrder> findByIdWithItems(@Param("id") UUID id);
}
