package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, UUID> {
    List<PurchaseOrderItem> findByPurchaseOrderId(UUID purchaseOrderId);
}
