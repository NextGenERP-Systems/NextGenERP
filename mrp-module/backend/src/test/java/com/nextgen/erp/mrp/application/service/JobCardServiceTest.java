package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.JobCard;
import com.nextgen.erp.mrp.domain.entity.JobCardTimeLog;
import com.nextgen.erp.mrp.domain.entity.WorkOrderOperation;
import com.nextgen.erp.mrp.domain.entity.QualityInspection;
import com.nextgen.erp.mrp.domain.repository.JobCardRepository;
import com.nextgen.erp.mrp.domain.repository.QualityInspectionRepository;
import com.nextgen.erp.mrp.domain.repository.WorkOrderRepository;
import com.nextgen.erp.mrp.domain.repository.InventoryMovementRepository;
import com.nextgen.erp.mrp.domain.repository.StateTransitionAuditRepository;
import com.nextgen.erp.mrp.domain.repository.WorkOrderOperationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class JobCardServiceTest {

    @Mock JobCardRepository jobCardRepository;
    @Mock WorkOrderRepository workOrderRepository;
    @Mock InventoryMovementRepository inventoryMovementRepository;
    @Mock WorkOrderService workOrderService;
    @Mock QualityInspectionRepository qualityInspectionRepository;
    @Mock StateTransitionAuditRepository stateTransitionAuditRepository;
    @Mock WorkOrderOperationRepository workOrderOperationRepository;

    @InjectMocks JobCardService service;

    @Test
    void rejectsCompletionWithoutPositiveQuantityBeforeLocking() {
        assertThrows(IllegalArgumentException.class,
                () -> service.completeJobCard("JC-1", BigDecimal.ZERO));
        verifyNoInteractions(jobCardRepository, workOrderRepository, workOrderService);
    }

    @Test
    void rejectsNegativeScrapBeforeLocking() {
        assertThrows(IllegalArgumentException.class,
                () -> service.completeJobCard("JC-1", BigDecimal.ONE, BigDecimal.valueOf(-1), "defect"));
        verifyNoInteractions(jobCardRepository, workOrderRepository, workOrderService);
    }

    @Test
    void rejectsNonOpenJobCardBeforeStarting() {
        JobCard card = validCard();
        card.setStatus("COMPLETED");
        org.mockito.Mockito.when(jobCardRepository.findByIdForUpdate("JC-1"))
                .thenReturn(java.util.Optional.of(card));

        assertThrows(IllegalStateException.class, () -> service.startJobCard("JC-1", "EMP-1"));
    }

    @Test
    void rejectsSecondActiveTimeLog() {
        JobCard card = validCard();
        JobCardTimeLog log = new JobCardTimeLog();
        log.setStartTime(ZonedDateTime.now());
        card.getTimeLogs().add(log);
        org.mockito.Mockito.when(jobCardRepository.findByIdForUpdate("JC-1"))
                .thenReturn(java.util.Optional.of(card));

        assertThrows(IllegalStateException.class, () -> service.startJobCard("JC-1", "EMP-1"));
    }

    @Test
    void rejectsCompletionWithoutPassedQualityInspection() {
        JobCard card = validCard();
        card.setStatus("WORK_IN_PROGRESS");
        when(jobCardRepository.findByIdForUpdate("JC-1"))
                .thenReturn(java.util.Optional.of(card));
        when(qualityInspectionRepository.findByWorkOrderId("WO-1"))
                .thenReturn(java.util.List.of());

        assertThrows(IllegalStateException.class,
                () -> service.completeJobCard("JC-1", BigDecimal.ONE));
    }

    @Test
    void rejectsCompletionWhenPassedInspectionQuantityIsInsufficient() {
        JobCard card = validCard();
        card.setStatus("WORK_IN_PROGRESS");
        when(jobCardRepository.findByIdForUpdate("JC-1"))
                .thenReturn(java.util.Optional.of(card));
        QualityInspection inspection = new QualityInspection();
        inspection.setStatus("PASSED");
        inspection.setInspectedQty(BigDecimal.valueOf(.5));
        when(qualityInspectionRepository.findByWorkOrderId("WO-1"))
                .thenReturn(java.util.List.of(inspection));

        assertThrows(IllegalStateException.class,
                () -> service.completeJobCard("JC-1", BigDecimal.ONE));
    }

    @Test
    void repeatedCompletionReturnsCompletedCardWithoutSavingAgain() {
        JobCard card = validCard();
        card.setStatus("COMPLETED");
        card.setCompletedQuantity(card.getForQuantity());
        when(jobCardRepository.findByIdForUpdate("JC-1"))
                .thenReturn(java.util.Optional.of(card));

        JobCard result = service.completeJobCard("JC-1", BigDecimal.ONE);

        org.junit.jupiter.api.Assertions.assertSame(card, result);
        verify(jobCardRepository, never()).save(any(JobCard.class));
    }

    @Test
    void recordsScrapAsAnInventoryMovement() {
        JobCard card = validCard();
        card.setStatus("WORK_IN_PROGRESS");
        card.setForQuantity(BigDecimal.valueOf(2));
        when(jobCardRepository.findByIdForUpdate("JC-1"))
                .thenReturn(java.util.Optional.of(card));
        when(inventoryMovementRepository.findBySourceReference("JC-SCRAP:JC-1:1"))
                .thenReturn(java.util.Optional.empty());
        when(jobCardRepository.save(card)).thenReturn(card);

        service.completeJobCard("JC-1", BigDecimal.ONE, BigDecimal.valueOf(.25), "Damaged");

        org.mockito.ArgumentCaptor<com.nextgen.erp.mrp.domain.entity.InventoryMovement> captor =
                org.mockito.ArgumentCaptor.forClass(com.nextgen.erp.mrp.domain.entity.InventoryMovement.class);
        verify(inventoryMovementRepository).save(captor.capture());
        org.junit.jupiter.api.Assertions.assertEquals("SCRAP", captor.getValue().getMovementType());
        org.junit.jupiter.api.Assertions.assertEquals(BigDecimal.valueOf(.25), captor.getValue().getQuantity());
    }

    @Test
    void updatesLinkedWorkOrderOperationProgress() {
        JobCard card = validCard();
        card.setStatus("WORK_IN_PROGRESS");
        UUID operationId = UUID.randomUUID();
        card.setWorkOrderOperationId(operationId);
        when(jobCardRepository.findByIdForUpdate("JC-1"))
                .thenReturn(java.util.Optional.of(card));
        WorkOrderOperation operation = new WorkOrderOperation();
        operation.setId(operationId);
        operation.setCompletedQty(BigDecimal.ZERO);
        operation.setStatus("PENDING");
        when(workOrderOperationRepository.findByIdForUpdate(operationId))
                .thenReturn(java.util.Optional.of(operation));
        when(jobCardRepository.save(card)).thenReturn(card);

        service.completeJobCard("JC-1", BigDecimal.valueOf(.5));

        org.junit.jupiter.api.Assertions.assertEquals(BigDecimal.valueOf(.5), operation.getCompletedQty());
        org.junit.jupiter.api.Assertions.assertEquals("IN_PROGRESS", operation.getStatus());
        verify(workOrderOperationRepository).save(operation);
    }

    private JobCard validCard() {
        JobCard card = new JobCard();
        card.setJobCardId("JC-1");
        card.setWorkOrderId("WO-1");
        card.setForQuantity(BigDecimal.ONE);
        card.setCompletedQuantity(BigDecimal.ZERO);
        card.setStatus("OPEN");
        return card;
    }
}
