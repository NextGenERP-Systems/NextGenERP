package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.InventoryMovement;
import com.nextgen.erp.mrp.domain.repository.InventoryMovementRepository;
import com.nextgen.erp.mrp.domain.repository.MockItemRepository;
import com.nextgen.erp.mrp.domain.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class InventoryMovementService {

    private static final Set<String> MOVEMENT_TYPES = Set.of(
            "RESERVATION", "ISSUE_TO_WIP", "CONSUMPTION", "REVERSAL",
            "SCRAP", "RECEIPT", "FINISHED_GOODS", "TRANSFER");

    private final InventoryMovementRepository inventoryMovementRepository;
    private final MockItemRepository mockItemRepository;
    private final WorkOrderRepository workOrderRepository;

    @Transactional(readOnly = true)
    public List<InventoryMovement> getMovementsForWorkOrder(String workOrderId) {
        if (workOrderId == null || workOrderId.isBlank()) {
            throw new IllegalArgumentException("Work order ID is required");
        }
        return inventoryMovementRepository.findByWorkOrderIdOrderByCreatedAtAsc(workOrderId);
    }

    @Transactional
    public InventoryMovement recordMovement(String itemCode, String warehouseId,
                                             java.math.BigDecimal quantity, String movementType,
                                             String workOrderId, String sourceReference) {
        if (itemCode == null || itemCode.isBlank()) {
            throw new IllegalArgumentException("Item code is required");
        }
        String normalizedItemCode = itemCode.trim();
        if (!mockItemRepository.existsById(normalizedItemCode)) {
            throw new IllegalArgumentException("MRP item does not exist: " + normalizedItemCode);
        }
        if (quantity == null || quantity.signum() <= 0) {
            throw new IllegalArgumentException("Movement quantity must be greater than zero");
        }
        String normalizedType = movementType == null ? "" : movementType.trim().toUpperCase();
        if (!MOVEMENT_TYPES.contains(normalizedType)) {
            throw new IllegalArgumentException("Unsupported inventory movement type: " + movementType);
        }
        if (sourceReference == null || sourceReference.isBlank()) {
            throw new IllegalArgumentException("Source reference is required for idempotency");
        }
        if (workOrderId != null && !workOrderId.isBlank()
                && !workOrderRepository.existsById(workOrderId.trim())) {
            throw new IllegalArgumentException("MRP work order does not exist: " + workOrderId);
        }
        var existing = inventoryMovementRepository.findBySourceReference(sourceReference);
        if (existing.isPresent()) {
            return existing.get();
        }

        InventoryMovement movement = new InventoryMovement();
        movement.setItemCode(normalizedItemCode);
        movement.setWarehouseId(warehouseId);
        movement.setQuantity(quantity);
        movement.setMovementType(normalizedType);
        movement.setWorkOrderId(workOrderId == null || workOrderId.isBlank() ? null : workOrderId.trim());
        movement.setSourceReference(sourceReference.trim());
        return inventoryMovementRepository.save(movement);
    }
}
