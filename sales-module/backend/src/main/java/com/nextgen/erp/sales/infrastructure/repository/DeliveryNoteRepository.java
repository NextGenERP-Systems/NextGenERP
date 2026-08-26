package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.DeliveryNote;
import com.nextgen.erp.sales.domain.model.DeliveryNoteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeliveryNoteRepository extends JpaRepository<DeliveryNote, UUID> {
    Optional<DeliveryNote> findByDeliveryNoteNumber(String deliveryNoteNumber);
    List<DeliveryNote> findBySalesOrderId(UUID salesOrderId);
    List<DeliveryNote> findByCustomerId(UUID customerId);
    List<DeliveryNote> findByStatus(DeliveryNoteStatus status);
    List<DeliveryNote> findAllByOrderByCreatedAtDesc();
}
