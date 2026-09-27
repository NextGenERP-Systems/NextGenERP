package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.repository.StateTransitionAuditRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StateTransitionAuditServiceTest {
    @Mock StateTransitionAuditRepository repository;
    @InjectMocks StateTransitionAuditService service;

    @Test
    void normalizesEntityTypeAndReturnsHistory() {
        when(repository.findByEntityTypeAndEntityIdOrderByCreatedAtAsc("WORK_ORDER", "WO-1"))
                .thenReturn(List.of());

        assertEquals(0, service.getHistory(" work_order ", "WO-1").size());
        verify(repository).findByEntityTypeAndEntityIdOrderByCreatedAtAsc("WORK_ORDER", "WO-1");
    }

    @Test
    void rejectsIncompleteQuery() {
        assertThrows(IllegalArgumentException.class, () -> service.getHistory("WORK_ORDER", " "));
    }
}
