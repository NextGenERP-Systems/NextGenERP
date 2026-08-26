package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.DeliveryNoteItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DeliveryNoteItemRepository extends JpaRepository<DeliveryNoteItem, UUID> {
    List<DeliveryNoteItem> findByDeliveryNoteId(UUID deliveryNoteId);
}
