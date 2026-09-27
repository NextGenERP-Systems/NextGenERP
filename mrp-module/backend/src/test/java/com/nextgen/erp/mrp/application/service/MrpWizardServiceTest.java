package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.repository.BomRepository;
import com.nextgen.erp.mrp.domain.repository.MockStockLedgerRepository;
import com.nextgen.erp.mrp.domain.entity.MrpRun;
import com.nextgen.erp.mrp.domain.repository.MrpRunRepository;
import com.nextgen.erp.mrp.domain.repository.MrpRunRequirementRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MrpWizardServiceTest {

    @Mock BomRepository bomRepository;
    @Mock MockStockLedgerRepository mockStockLedgerRepository;
    @Mock MrpRunRepository mrpRunRepository;
    @Mock MrpRunRequirementRepository mrpRunRequirementRepository;

    @InjectMocks MrpWizardService service;

    @Test
    void rejectsNonPositivePlanningQuantityBeforeExplosion() {
        assertThrows(IllegalArgumentException.class,
                () -> service.calculateMaterialRequirements("BOM-001", BigDecimal.ZERO));
        verifyNoInteractions(bomRepository, mockStockLedgerRepository);
    }

    @Test
    void rejectsMissingBomNumberBeforeExplosion() {
        assertThrows(IllegalArgumentException.class,
                () -> service.calculateMaterialRequirements("", BigDecimal.ONE));
        verifyNoInteractions(bomRepository, mockStockLedgerRepository);
    }

    @Test
    void rejectsMissingBomBeforeExplosion() {
        when(bomRepository.existsById("MISSING-BOM")).thenReturn(false);

        assertThrows(IllegalArgumentException.class,
                () -> service.calculateMaterialRequirements("MISSING-BOM", BigDecimal.ONE));
        verifyNoInteractions(mockStockLedgerRepository);
    }

    @Test
    void aggregatesRepeatedExplosionRowsByItem() {
        when(bomRepository.existsById("BOM-001")).thenReturn(true);
        when(bomRepository.explodeBomWithCte("BOM-001", LocalDate.now())).thenReturn(List.of(
                Map.of("item_code", "RAW-1", "total_exploded_qty", BigDecimal.ONE,
                        "total_exploded_amount", BigDecimal.TEN),
                Map.of("item_code", "RAW-1", "total_exploded_qty", BigDecimal.valueOf(2),
                        "total_exploded_amount", BigDecimal.valueOf(20))));
        when(mockStockLedgerRepository.findTotalStockByItemCode("RAW-1")).thenReturn(BigDecimal.ZERO);
        when(bomRepository.findByItemCodeAndIsDefaultTrue("RAW-1")).thenReturn(Optional.empty());
        MrpRun savedRun = new MrpRun();
        savedRun.setRunId(UUID.randomUUID());
        when(mrpRunRepository.save(org.mockito.ArgumentMatchers.any(MrpRun.class))).thenReturn(savedRun);

        Map<String, Object> result = service.calculateMaterialRequirements("BOM-001", BigDecimal.ONE);

        assertEquals(1, result.get("totalExplodedItems"));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> requirements = (List<Map<String, Object>>) result.get("requirements");
        assertEquals(BigDecimal.valueOf(3), requirements.get(0).get("total_exploded_qty"));
        assertEquals(BigDecimal.valueOf(3), requirements.get(0).get("required_total_qty"));
        assertEquals("PURCHASE_ORDER", requirements.get(0).get("action_recommended"));
    }
}
