package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.WorkOrder;
import com.nextgen.erp.mrp.domain.repository.BomRepository;
import com.nextgen.erp.mrp.domain.repository.JobCardRepository;
import com.nextgen.erp.mrp.domain.repository.MockItemRepository;
import com.nextgen.erp.mrp.domain.repository.RoutingRepository;
import com.nextgen.erp.mrp.domain.repository.WorkOrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkOrderStateServiceTest {

    @Mock WorkOrderRepository workOrderRepository;
    @Mock BomRepository bomRepository;
    @Mock RoutingRepository routingRepository;
    @Mock JobCardRepository jobCardRepository;
    @Mock MockItemRepository mockItemRepository;

    @InjectMocks WorkOrderService service;

    @Test
    void rejectsSubmissionFromCompletedState() {
        WorkOrder workOrder = new WorkOrder();
        workOrder.setWorkOrderId("WO-001");
        workOrder.setStatus("COMPLETED");
        when(workOrderRepository.findByIdForUpdate("WO-001")).thenReturn(java.util.Optional.of(workOrder));

        assertThrows(IllegalStateException.class, () -> service.submitWorkOrder("WO-001"));
        verify(workOrderRepository, never()).save(any());
    }

    @Test
    void rejectsNonPositiveMaterialConsumptionBeforeLockingOrder() {
        assertThrows(IllegalArgumentException.class,
                () -> service.logMaterialConsumption("WO-001", "ITEM-001", BigDecimal.ZERO));
        verifyNoInteractions(workOrderRepository);
    }
}
