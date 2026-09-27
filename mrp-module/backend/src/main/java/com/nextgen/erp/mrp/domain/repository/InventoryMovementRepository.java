package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, UUID> {
    List<InventoryMovement> findByWorkOrderIdOrderByCreatedAtAsc(String workOrderId);
    Optional<InventoryMovement> findBySourceReference(String sourceReference);
}
