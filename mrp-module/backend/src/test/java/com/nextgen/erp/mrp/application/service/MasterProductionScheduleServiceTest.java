package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.MasterProductionSchedule;
import com.nextgen.erp.mrp.domain.entity.ProductionPlan;
import com.nextgen.erp.mrp.domain.repository.BomRepository;
import com.nextgen.erp.mrp.domain.repository.MasterProductionScheduleRepository;
import com.nextgen.erp.mrp.domain.repository.MockItemRepository;
import com.nextgen.erp.mrp.domain.repository.ProductionPlanRepository;
import com.nextgen.erp.mrp.domain.repository.StateTransitionAuditRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
class MasterProductionScheduleServiceTest {

    @Mock MasterProductionScheduleRepository mpsRepository;
    @Mock ProductionPlanRepository productionPlanRepository;
    @Mock MockItemRepository mockItemRepository;
    @Mock BomRepository bomRepository;
    @Mock StateTransitionAuditRepository stateTransitionAuditRepository;

    @InjectMocks MasterProductionScheduleService service;

    @Test
    void rejectsNonPositivePlannedQuantityBeforePersistence() {
        MasterProductionSchedule mps = validSchedule();
        mps.setPlannedQty(BigDecimal.ZERO);

        assertThrows(IllegalArgumentException.class, () -> service.createSchedule(mps));
        verifyNoInteractions(mpsRepository, mockItemRepository, bomRepository);
    }

    @Test
    void rejectsMissingScheduleDateBeforePersistence() {
        MasterProductionSchedule mps = validSchedule();
        mps.setScheduleDate(null);

        assertThrows(IllegalArgumentException.class, () -> service.createSchedule(mps));
        verifyNoInteractions(mpsRepository, mockItemRepository, bomRepository);
    }

    @Test
    void rejectsUnsupportedSourceTypeBeforePersistence() {
        MasterProductionSchedule mps = validSchedule();
        mps.setSourceType("IMPORT");

        assertThrows(IllegalArgumentException.class, () -> service.createSchedule(mps));
        verifyNoInteractions(mpsRepository, mockItemRepository, bomRepository);
    }

    @Test
    void rejectsUnsupportedStatusBeforePersistence() {
        MasterProductionSchedule mps = validSchedule();
        mps.setStatus("RELEASED");

        assertThrows(IllegalArgumentException.class, () -> service.createSchedule(mps));
        verifyNoInteractions(mpsRepository, mockItemRepository, bomRepository);
    }

    @Test
    void rejectsCreatingAlreadySubmittedMps() {
        MasterProductionSchedule mps = validSchedule();
        mps.setStatus("SUBMITTED");

        org.junit.jupiter.api.Assertions.assertThrows(IllegalStateException.class,
                () -> service.createSchedule(mps));
        verifyNoInteractions(mpsRepository, mockItemRepository, bomRepository);
    }

    @Test
    void returnsExistingPlanWithoutCreatingDuplicate() {
        MasterProductionSchedule mps = validSchedule();
        mps.setMpsId("MPS-001");
        mps.setStatus("SUBMITTED");
        ProductionPlan existingPlan = new ProductionPlan();
        when(mpsRepository.findByMpsIdForUpdate("MPS-001")).thenReturn(Optional.of(mps));
        when(productionPlanRepository.findFirstByItemsSalesOrderRef("MPS:MPS-001")).thenReturn(existingPlan);

        ProductionPlan result = service.convertMpsToProductionPlan("MPS-001");

        org.junit.jupiter.api.Assertions.assertSame(existingPlan, result);
        verify(productionPlanRepository, never()).save(any(ProductionPlan.class));
        verify(mpsRepository, never()).save(any(MasterProductionSchedule.class));
    }

    @Test
    void rejectsDraftMpsConversion() {
        MasterProductionSchedule mps = validSchedule();
        mps.setMpsId("MPS-DRAFT");
        when(mpsRepository.findByMpsIdForUpdate("MPS-DRAFT")).thenReturn(Optional.of(mps));
        when(productionPlanRepository.findFirstByItemsSalesOrderRef("MPS:MPS-DRAFT")).thenReturn(null);

        org.junit.jupiter.api.Assertions.assertThrows(IllegalStateException.class,
                () -> service.convertMpsToProductionPlan("MPS-DRAFT"));
        verify(productionPlanRepository).findFirstByItemsSalesOrderRef("MPS:MPS-DRAFT");
        verify(productionPlanRepository, never()).save(any(ProductionPlan.class));
    }

    @Test
    void submitsDraftMpsThroughExplicitTransition() {
        MasterProductionSchedule mps = validSchedule();
        mps.setMpsId("MPS-SUBMIT");
        when(mpsRepository.findByMpsIdForUpdate("MPS-SUBMIT")).thenReturn(Optional.of(mps));
        when(mpsRepository.save(mps)).thenReturn(mps);

        MasterProductionSchedule result = service.submitSchedule("MPS-SUBMIT");

        org.junit.jupiter.api.Assertions.assertSame(mps, result);
        org.junit.jupiter.api.Assertions.assertEquals("SUBMITTED", result.getStatus());
        verify(mpsRepository).save(mps);
    }

    @Test
    void repeatedMpsSubmissionDoesNotWriteAgain() {
        MasterProductionSchedule mps = validSchedule();
        mps.setMpsId("MPS-SUBMITTED");
        mps.setStatus("SUBMITTED");
        when(mpsRepository.findByMpsIdForUpdate("MPS-SUBMITTED")).thenReturn(Optional.of(mps));

        org.junit.jupiter.api.Assertions.assertSame(mps, service.submitSchedule("MPS-SUBMITTED"));
        verify(mpsRepository, never()).save(any(MasterProductionSchedule.class));
    }

    private MasterProductionSchedule validSchedule() {
        MasterProductionSchedule mps = new MasterProductionSchedule();
        mps.setItemCode("ITEM-001");
        mps.setBomNo("BOM-001");
        mps.setScheduleDate(LocalDate.now());
        mps.setPlannedQty(BigDecimal.ONE);
        return mps;
    }
}
