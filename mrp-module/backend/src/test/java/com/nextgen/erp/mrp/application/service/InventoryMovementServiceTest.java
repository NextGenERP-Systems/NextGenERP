package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.InventoryMovement;
import com.nextgen.erp.mrp.domain.repository.InventoryMovementRepository;
import com.nextgen.erp.mrp.domain.repository.MockItemRepository;
import com.nextgen.erp.mrp.domain.repository.WorkOrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryMovementServiceTest {
    @Mock InventoryMovementRepository movementRepository;
    @Mock MockItemRepository itemRepository;
    @Mock WorkOrderRepository workOrderRepository;
    @InjectMocks InventoryMovementService service;

    @Test
    void recordsSupportedMovementForExistingItem() {
        when(itemRepository.existsById("RAW-CF-SHEET")).thenReturn(true);
        when(movementRepository.findBySourceReference("RESERVE:1")).thenReturn(Optional.empty());
        InventoryMovement saved = new InventoryMovement();
        when(movementRepository.save(any(InventoryMovement.class))).thenReturn(saved);

        assertSame(saved, service.recordMovement("RAW-CF-SHEET", "WH-STORES", BigDecimal.ONE,
                "reservation", null, "RESERVE:1"));
        verify(movementRepository).save(any(InventoryMovement.class));
    }

    @Test
    void returnsExistingMovementForIdempotentRetry() {
        when(itemRepository.existsById("RAW-CF-SHEET")).thenReturn(true);
        InventoryMovement existing = new InventoryMovement();
        when(movementRepository.findBySourceReference("RESERVE:1")).thenReturn(Optional.of(existing));

        assertSame(existing, service.recordMovement("RAW-CF-SHEET", "WH-STORES", BigDecimal.ONE,
                "RESERVATION", null, "RESERVE:1"));
        verify(movementRepository, never()).save(any(InventoryMovement.class));
    }

    @Test
    void rejectsUnknownItemBeforePersistence() {
        when(itemRepository.existsById("UNKNOWN")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> service.recordMovement(
                "UNKNOWN", "WH-STORES", BigDecimal.ONE, "RESERVATION", null, "RESERVE:2"));
        verify(movementRepository, never()).save(any(InventoryMovement.class));
    }
}
