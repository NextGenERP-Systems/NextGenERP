package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.WorkOrder;
import com.nextgen.erp.mrp.domain.entity.QualityInspection;
import com.nextgen.erp.mrp.domain.repository.BomRepository;
import com.nextgen.erp.mrp.domain.repository.JobCardRepository;
import com.nextgen.erp.mrp.domain.repository.InventoryMovementRepository;
import com.nextgen.erp.mrp.domain.repository.MockItemRepository;
import com.nextgen.erp.mrp.domain.repository.RoutingRepository;
import com.nextgen.erp.mrp.domain.repository.QualityInspectionRepository;
import com.nextgen.erp.mrp.domain.repository.StateTransitionAuditRepository;
import com.nextgen.erp.mrp.domain.repository.WorkOrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class WorkOrderServiceTest {

    @Mock WorkOrderRepository workOrderRepository;
    @Mock BomRepository bomRepository;
    @Mock RoutingRepository routingRepository;
    @Mock JobCardRepository jobCardRepository;
    @Mock InventoryMovementRepository inventoryMovementRepository;
    @Mock MockItemRepository mockItemRepository;
    @Mock QualityInspectionRepository qualityInspectionRepository;
    @Mock StateTransitionAuditRepository stateTransitionAuditRepository;

    @InjectMocks WorkOrderService service;

    @Test
    void rejectsNonPositiveQuantityBeforePersistence() {
        WorkOrder workOrder = validWorkOrder();
        workOrder.setQtyToProduce(BigDecimal.ZERO);

        assertThrows(IllegalArgumentException.class, () -> service.createWorkOrder(workOrder));
        verifyNoInteractions(workOrderRepository, mockItemRepository, bomRepository);
    }

    @Test
    void rejectsEndDateBeforeStartDateBeforePersistence() {
        WorkOrder workOrder = validWorkOrder();
        workOrder.setPlannedEndDate(workOrder.getPlannedStartDate().minusHours(1));

        assertThrows(IllegalArgumentException.class, () -> service.createWorkOrder(workOrder));
        verifyNoInteractions(workOrderRepository, mockItemRepository, bomRepository);
    }

    @Test
    void rejectsUnsupportedStatusBeforePersistence() {
        WorkOrder workOrder = validWorkOrder();
        workOrder.setStatus("RELEASED");

        assertThrows(IllegalArgumentException.class, () -> service.createWorkOrder(workOrder));
        verifyNoInteractions(workOrderRepository, mockItemRepository, bomRepository);
    }

    @Test
    void returnsLockedWorkOrderWithoutDuplicatingKeyedConsumption() {
        WorkOrder workOrder = validWorkOrder();
        workOrder.setWorkOrderId("WO-1");
        workOrder.setStatus("IN_PROGRESS");
        when(workOrderRepository.findByIdForUpdate("WO-1"))
                .thenReturn(java.util.Optional.of(workOrder));
        when(inventoryMovementRepository.findBySourceReference("WO-CONSUME:WO-1:REQ-1"))
                .thenReturn(java.util.Optional.of(new com.nextgen.erp.mrp.domain.entity.InventoryMovement()));

        WorkOrder result = service.logMaterialConsumption("WO-1", "ITEM-001", BigDecimal.ONE, "REQ-1");

        org.junit.jupiter.api.Assertions.assertSame(workOrder, result);
        org.mockito.Mockito.verify(workOrderRepository, org.mockito.Mockito.never())
                .save(org.mockito.ArgumentMatchers.any(WorkOrder.class));
    }

    @Test
    void blocksCompletionWhenChildWorkOrderIsNotComplete() {
        WorkOrder parent = validWorkOrder();
        parent.setWorkOrderId("WO-PARENT");
        parent.setStatus("IN_PROGRESS");
        WorkOrder child = validWorkOrder();
        child.setWorkOrderId("WO-CHILD");
        child.setStatus("IN_PROGRESS");
        when(workOrderRepository.findByIdForUpdate("WO-PARENT"))
                .thenReturn(java.util.Optional.of(parent));
        when(workOrderRepository.findByParentWoId("WO-PARENT"))
                .thenReturn(java.util.List.of(child));

        assertThrows(IllegalStateException.class, () -> service.completeWorkOrder("WO-PARENT"));
        org.mockito.Mockito.verify(workOrderRepository, org.mockito.Mockito.never())
                .save(org.mockito.ArgumentMatchers.any(WorkOrder.class));
    }

    @Test
    void recordsFinishedGoodsOnceWhenWorkOrderCompletes() {
        WorkOrder workOrder = validWorkOrder();
        workOrder.setWorkOrderId("WO-1");
        workOrder.setStatus("IN_PROGRESS");
        when(workOrderRepository.findByIdForUpdate("WO-1"))
                .thenReturn(java.util.Optional.of(workOrder));
        when(workOrderRepository.findByParentWoId("WO-1"))
                .thenReturn(java.util.List.of());
        QualityInspection inspection = new QualityInspection();
        inspection.setStatus("PASSED");
        inspection.setInspectedQty(BigDecimal.ONE);
        when(qualityInspectionRepository.findByWorkOrderId("WO-1"))
                .thenReturn(java.util.List.of(inspection));
        when(inventoryMovementRepository.findBySourceReference("WO-FINISH:WO-1"))
                .thenReturn(java.util.Optional.empty());
        when(workOrderRepository.save(workOrder)).thenReturn(workOrder);

        WorkOrder result = service.completeWorkOrder("WO-1");

        org.junit.jupiter.api.Assertions.assertSame(workOrder, result);
        org.mockito.ArgumentCaptor<com.nextgen.erp.mrp.domain.entity.InventoryMovement> captor =
                org.mockito.ArgumentCaptor.forClass(com.nextgen.erp.mrp.domain.entity.InventoryMovement.class);
        verify(inventoryMovementRepository).save(captor.capture());
        org.junit.jupiter.api.Assertions.assertEquals("FINISHED_GOODS", captor.getValue().getMovementType());
        org.junit.jupiter.api.Assertions.assertEquals("WO-FINISH:WO-1", captor.getValue().getSourceReference());
    }

    @Test
    void rejectsWorkOrderCompletionWhenPassedInspectionQuantityIsInsufficient() {
        WorkOrder workOrder = validWorkOrder();
        workOrder.setWorkOrderId("WO-1");
        workOrder.setStatus("IN_PROGRESS");
        when(workOrderRepository.findByIdForUpdate("WO-1"))
                .thenReturn(java.util.Optional.of(workOrder));
        when(workOrderRepository.findByParentWoId("WO-1"))
                .thenReturn(java.util.List.of());
        QualityInspection inspection = new QualityInspection();
        inspection.setStatus("PASSED");
        inspection.setInspectedQty(BigDecimal.valueOf(.5));
        when(qualityInspectionRepository.findByWorkOrderId("WO-1"))
                .thenReturn(java.util.List.of(inspection));
        when(inventoryMovementRepository.findBySourceReference("WO-FINISH:WO-1"))
                .thenReturn(java.util.Optional.empty());

        assertThrows(IllegalStateException.class, () -> service.completeWorkOrder("WO-1"));
    }

    @Test
    void repeatedCompletionReturnsLockedOrderWithoutNewMovement() {
        WorkOrder workOrder = validWorkOrder();
        workOrder.setWorkOrderId("WO-1");
        workOrder.setStatus("COMPLETED");
        when(workOrderRepository.findByIdForUpdate("WO-1"))
                .thenReturn(java.util.Optional.of(workOrder));
        when(inventoryMovementRepository.findBySourceReference("WO-FINISH:WO-1"))
                .thenReturn(java.util.Optional.of(new com.nextgen.erp.mrp.domain.entity.InventoryMovement()));
        when(workOrderRepository.save(workOrder)).thenReturn(workOrder);

        org.junit.jupiter.api.Assertions.assertSame(workOrder, service.completeWorkOrder("WO-1"));
        org.junit.jupiter.api.Assertions.assertEquals(workOrder.getQtyToProduce(), workOrder.getProducedQty());
        org.junit.jupiter.api.Assertions.assertNotNull(workOrder.getActualEndDate());
        org.mockito.Mockito.verify(inventoryMovementRepository, org.mockito.Mockito.never())
                .save(org.mockito.ArgumentMatchers.any());
    }

    private WorkOrder validWorkOrder() {
        WorkOrder workOrder = new WorkOrder();
        workOrder.setProductionItem("ITEM-001");
        workOrder.setBomNo("BOM-001");
        workOrder.setQtyToProduce(BigDecimal.ONE);
        workOrder.setPlannedStartDate(ZonedDateTime.now());
        workOrder.setPlannedEndDate(ZonedDateTime.now().plusHours(1));
        return workOrder;
    }
}
