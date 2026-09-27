package com.nextgen.erp.mrp.presentation.dto;

import java.math.BigDecimal;

public record InventoryMovementRequest(
        String itemCode,
        String warehouseId,
        BigDecimal quantity,
        String movementType,
        String workOrderId,
        String sourceReference) {
}
