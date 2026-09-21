package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.ProductionPlan;
import com.nextgen.erp.mrp.domain.entity.ProductionPlanItem;
import com.nextgen.erp.mrp.domain.entity.WorkOrder;
import com.nextgen.erp.mrp.domain.entity.MrpRunRequirement;
import com.nextgen.erp.mrp.domain.entity.Bom;
import com.nextgen.erp.mrp.domain.repository.ProductionPlanRepository;
import com.nextgen.erp.mrp.domain.repository.WorkOrderRepository;
import com.nextgen.erp.mrp.domain.repository.MrpRunRequirementRepository;
import com.nextgen.erp.mrp.domain.repository.BomRepository;
import com.nextgen.erp.mrp.domain.repository.StateTransitionAuditRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductionPlanServiceTest {

    @Mock ProductionPlanRepository productionPlanRepository;
    @Mock WorkOrderRepository workOrderRepository;
    @Mock WorkOrderService workOrderService;
    @Mock MrpRunRequirementRepository mrpRunRequirementRepository;
    @Mock BomRepository bomRepository;
    @Mock StateTransitionAuditRepository stateTransitionAuditRepository;

    @InjectMocks ProductionPlanService service;

    @Test
    void normalizesAndAcceptsSupportedStatus() {
        ProductionPlan plan = new ProductionPlan();
        plan.setPlanId("PLAN-1");
        plan.setStatus("draft");
        when(productionPlanRepository.save(any(ProductionPlan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductionPlan result = service.createProductionPlan(plan);

        assertEquals("DRAFT", result.getStatus());
    }

    @Test
    void rejectsUnsupportedStatus() {
        ProductionPlan plan = new ProductionPlan();
        plan.setPlanId("PLAN-1");
        plan.setStatus("RELEASED");

        assertThrows(IllegalArgumentException.class, () -> service.createProductionPlan(plan));
    }

    @Test
    void onlyDraftPlansCanBeSubmitted() {
        ProductionPlan plan = new ProductionPlan();
        plan.setPlanId("PLAN-1");
        plan.setStatus("COMPLETED");
        when(productionPlanRepository.findByPlanId("PLAN-1")).thenReturn(Optional.of(plan));

        assertThrows(IllegalStateException.class, () -> service.submitProductionPlan("PLAN-1"));
    }

    @Test
    void repeatedSubmissionReturnsSubmittedPlanWithoutSavingAgain() {
        ProductionPlan plan = new ProductionPlan();
        plan.setPlanId("PLAN-1");
        plan.setStatus("SUBMITTED");
        when(productionPlanRepository.findByPlanId("PLAN-1")).thenReturn(Optional.of(plan));

        assertEquals(plan, service.submitProductionPlan("PLAN-1"));
        org.mockito.Mockito.verify(productionPlanRepository, org.mockito.Mockito.never())
                .save(any(ProductionPlan.class));
    }

    @Test
    void retriesRepairMissingChildWorkOrdersWhenParentAlreadyExists() {
        ProductionPlan plan = new ProductionPlan();
        plan.setPlanId("PLAN-1");
        plan.setStatus("SUBMITTED");
        plan.setSourceMrpRunId(UUID.randomUUID());
        plan.setPostingDate(java.time.LocalDate.now());
        ProductionPlanItem item = new ProductionPlanItem();
        item.setId(UUID.randomUUID());
        item.setItemCode("ITEM-FG");
        item.setBomNo("BOM-FG");
        item.setPlannedQty(BigDecimal.ONE);
        plan.setItems(List.of(item));

        WorkOrder parent = new WorkOrder();
        parent.setWorkOrderId("WO-PLAN-PLAN-1-" + item.getId());
        when(productionPlanRepository.findByPlanIdForUpdate("PLAN-1")).thenReturn(Optional.of(plan));
        when(workOrderRepository.findById(any(String.class))).thenAnswer(invocation ->
                parent.getWorkOrderId().equals(invocation.getArgument(0)) ? Optional.of(parent) : Optional.empty());

        MrpRunRequirement requirement = new MrpRunRequirement();
        requirement.setItemCode("ITEM-SUB");
        requirement.setRecommendedAction("SPAWN_WORK_ORDER");
        requirement.setShortageQty(BigDecimal.ONE);
        when(mrpRunRequirementRepository.findByRunId(plan.getSourceMrpRunId())).thenReturn(List.of(requirement));
        Bom childBom = new Bom();
        childBom.setBomNo("BOM-SUB");
        when(bomRepository.findByItemCodeAndIsDefaultTrue("ITEM-SUB")).thenReturn(Optional.of(childBom));
        when(workOrderService.createWorkOrder(any(WorkOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<WorkOrder> result = service.generateWorkOrders("PLAN-1");

        assertEquals(2, result.size());
        assertEquals(parent.getWorkOrderId(), result.get(0).getWorkOrderId());
        assertEquals(parent.getWorkOrderId(), result.get(1).getParentWoId());
    }
}
