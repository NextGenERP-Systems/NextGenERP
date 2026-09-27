package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.QualityInspection;
import com.nextgen.erp.mrp.domain.entity.QualityInspectionReading;
import com.nextgen.erp.mrp.domain.repository.QualityInspectionRepository;
import com.nextgen.erp.mrp.domain.repository.StateTransitionAuditRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QualityServiceTest {

    @Mock QualityInspectionRepository repository;
    @Mock StateTransitionAuditRepository auditRepository;
    @InjectMocks QualityService service;

    @Test
    void derivesPendingWhenAnyReadingIsPending() {
        QualityInspection inspection = inspection("PENDING");
        when(repository.save(any(QualityInspection.class))).thenAnswer(invocation -> invocation.getArgument(0));

        QualityInspection result = service.createInspection(inspection);

        assertEquals("PENDING", result.getStatus());
    }

    @Test
    void rejectsInspectionWithoutReadings() {
        QualityInspection inspection = inspection(null);
        inspection.setReadings(List.of());

        assertThrows(IllegalArgumentException.class, () -> service.createInspection(inspection));
    }

    @Test
    void rejectsIncompleteReadingBeforePersistence() {
        QualityInspection inspection = inspection("PASSED");
        inspection.getReadings().get(0).setParameterName(null);

        assertThrows(IllegalArgumentException.class, () -> service.createInspection(inspection));
        verify(repository, never()).save(any());
    }

    private QualityInspection inspection(String readingStatus) {
        QualityInspection inspection = new QualityInspection();
        inspection.setInspectionId("QI-1");
        inspection.setWorkOrderId("WO-1");
        inspection.setInspectedQty(BigDecimal.ONE);
        QualityInspectionReading reading = new QualityInspectionReading();
        reading.setParameterName("Voltage");
        reading.setReadingValue(BigDecimal.ONE);
        reading.setStatus(readingStatus);
        inspection.setReadings(List.of(reading));
        return inspection;
    }
}
