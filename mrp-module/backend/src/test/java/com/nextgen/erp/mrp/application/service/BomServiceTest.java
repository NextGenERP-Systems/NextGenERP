package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.Bom;
import com.nextgen.erp.mrp.domain.entity.BomItem;
import com.nextgen.erp.mrp.domain.repository.BomRepository;
import com.nextgen.erp.mrp.domain.repository.StateTransitionAuditRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;
import java.util.Optional;
import java.time.LocalDate;

@ExtendWith(MockitoExtension.class)
class BomServiceTest {

    @Mock BomRepository bomRepository;
    @Mock StateTransitionAuditRepository stateTransitionAuditRepository;
    @InjectMocks BomService service;

    @Test
    void rejectsSelfReferencingBom() {
        Bom bom = bom("BOM-A", "ITEM-A");
        BomItem item = new BomItem();
        item.setItemCode("ITEM-A");
        item.setQty(BigDecimal.ONE);
        item.setSubBomNo("BOM-A");
        bom.setItems(List.of(item));

        assertThrows(IllegalArgumentException.class, () -> service.saveBom(bom));
        verifyNoInteractions(bomRepository);
    }

    @Test
    void rejectsNonPositiveComponentQuantity() {
        Bom bom = bom("BOM-A", "ITEM-A");
        BomItem item = new BomItem();
        item.setItemCode("ITEM-B");
        item.setQty(BigDecimal.ZERO);
        bom.setItems(List.of(item));

        assertThrows(IllegalArgumentException.class, () -> service.saveBom(bom));
        verifyNoInteractions(bomRepository);
    }

    @Test
    void rejectsUnsupportedBomStatus() {
        Bom bom = bom("BOM-A", "ITEM-A");
        bom.setStatus("RELEASED");
        when(bomRepository.findAll()).thenReturn(List.of());

        assertThrows(IllegalArgumentException.class, () -> service.saveBom(bom));
        verify(bomRepository).findAll();
        verify(bomRepository, never()).save(any(Bom.class));
    }

    @Test
    void approvesDraftBom() {
        Bom bom = bom("BOM-A", "ITEM-A");
        bom.setStatus("DRAFT");
        when(bomRepository.findById("BOM-A")).thenReturn(Optional.of(bom));
        when(bomRepository.findAll()).thenReturn(List.of(bom));
        when(bomRepository.save(any(Bom.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Bom result = service.approveBom("BOM-A");

        org.junit.jupiter.api.Assertions.assertEquals("ACTIVE", result.getStatus());
        verify(bomRepository).save(bom);
    }

    @Test
    void rejectsInPlaceEditOfActiveBom() {
        Bom incoming = bom("BOM-A", "ITEM-A");
        Bom active = bom("BOM-A", "ITEM-A");
        active.setStatus("ACTIVE");
        when(bomRepository.findById("BOM-A")).thenReturn(Optional.of(active));

        assertThrows(IllegalStateException.class, () -> service.saveBom(incoming));
        verify(bomRepository, never()).save(any(Bom.class));
    }

    @Test
    void rejectsInvalidEffectiveWindow() {
        Bom bom = bom("BOM-DATES", "ITEM-A");
        bom.setEffectiveFrom(LocalDate.of(2026, 10, 1));
        bom.setEffectiveTo(LocalDate.of(2026, 9, 30));

        assertThrows(IllegalArgumentException.class, () -> service.saveBom(bom));
        verifyNoInteractions(bomRepository);
    }

    private Bom bom(String bomNo, String itemCode) {
        Bom bom = new Bom();
        bom.setBomNo(bomNo);
        bom.setItemCode(itemCode);
        bom.setQuantity(BigDecimal.ONE);
        bom.setItems(List.of());
        return bom;
    }
}
