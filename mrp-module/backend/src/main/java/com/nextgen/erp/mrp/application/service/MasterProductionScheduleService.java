package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.*;
import com.nextgen.erp.mrp.domain.repository.BomRepository;
import com.nextgen.erp.mrp.domain.repository.MasterProductionScheduleRepository;
import com.nextgen.erp.mrp.domain.repository.MockItemRepository;
import com.nextgen.erp.mrp.domain.repository.ProductionPlanRepository;
import com.nextgen.erp.mrp.domain.repository.StateTransitionAuditRepository;
import com.nextgen.erp.mrp.domain.entity.StateTransitionAudit;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MasterProductionScheduleService {

    private static final Set<String> ALLOWED_SOURCE_TYPES = Set.of("FORECAST", "SALES_ORDER", "MANUAL");
    private static final Set<String> ALLOWED_STATUSES = Set.of("DRAFT", "SUBMITTED", "COMPLETED", "CANCELLED");

    private final MasterProductionScheduleRepository mpsRepository;
    private final ProductionPlanRepository productionPlanRepository;
    private final MockItemRepository mockItemRepository;
    private final BomRepository bomRepository;
    private final StateTransitionAuditRepository stateTransitionAuditRepository;

    @Transactional(readOnly = true)
    public List<MasterProductionSchedule> getAllSchedules() {
        return mpsRepository.findAll();
    }

    @Transactional
    public MasterProductionSchedule createSchedule(MasterProductionSchedule mps) {
        if (mps.getPlannedQty() == null || mps.getPlannedQty().signum() <= 0) {
            throw new IllegalArgumentException("MPS planned quantity must be greater than zero");
        }
        if (mps.getScheduleDate() == null) {
            throw new IllegalArgumentException("MPS schedule date is required");
        }
        if (mps.getSourceType() == null || !ALLOWED_SOURCE_TYPES.contains(mps.getSourceType().toUpperCase())) {
            throw new IllegalArgumentException("Unsupported MPS source type: " + mps.getSourceType());
        }
        if (mps.getStatus() == null || !ALLOWED_STATUSES.contains(mps.getStatus().toUpperCase())) {
            throw new IllegalArgumentException("Unsupported MPS status: " + mps.getStatus());
        }
        if (!"DRAFT".equalsIgnoreCase(mps.getStatus())) {
            throw new IllegalStateException("New MPS records must start in DRAFT status");
        }
        mps.setSourceType(mps.getSourceType().toUpperCase());
        mps.setStatus(mps.getStatus().toUpperCase());
        if (mps.getMpsId() == null || mps.getMpsId().isBlank()) {
            mps.setMpsId("MPS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        if (mps.getItemCode() != null && !mps.getItemCode().isBlank()) {
            if (!mockItemRepository.existsById(mps.getItemCode())) {
                throw new IllegalArgumentException("Item master not found: " + mps.getItemCode());
            }
        }

        if (mps.getBomNo() != null && !mps.getBomNo().isBlank()) {
            if (!bomRepository.existsById(mps.getBomNo())) {
                throw new IllegalArgumentException("BOM not found: " + mps.getBomNo());
            }
        }

        return mpsRepository.save(mps);
    }

    @Transactional
    public MasterProductionSchedule submitSchedule(String mpsId) {
        MasterProductionSchedule mps = mpsRepository.findByMpsIdForUpdate(mpsId)
                .orElseThrow(() -> new IllegalArgumentException("MPS record not found with ID: " + mpsId));
        if ("SUBMITTED".equalsIgnoreCase(mps.getStatus())
                || "COMPLETED".equalsIgnoreCase(mps.getStatus())) {
            return mps;
        }
        if (!"DRAFT".equalsIgnoreCase(mps.getStatus())) {
            throw new IllegalStateException("MPS " + mpsId + " cannot be submitted from status " + mps.getStatus());
        }
        String previousStatus = mps.getStatus();
        mps.setStatus("SUBMITTED");
        StateTransitionAudit audit = new StateTransitionAudit();
        audit.setEntityType("MPS");
        audit.setEntityId(mpsId);
        audit.setFromStatus(previousStatus);
        audit.setToStatus("SUBMITTED");
        audit.setAction("SUBMIT");
        stateTransitionAuditRepository.save(audit);
        return mpsRepository.save(mps);
    }

    @Transactional
    public ProductionPlan convertMpsToProductionPlan(String mpsId) {
        MasterProductionSchedule mps = mpsRepository.findByMpsIdForUpdate(mpsId)
                .orElseThrow(() -> new IllegalArgumentException("MPS record not found with ID: " + mpsId));

        String sourceReference = "MPS:" + mps.getMpsId();
        ProductionPlan existingPlan = productionPlanRepository.findFirstByItemsSalesOrderRef(sourceReference);
        if (existingPlan != null) {
            return existingPlan;
        }

        if (!"SUBMITTED".equalsIgnoreCase(mps.getStatus())) {
            throw new IllegalStateException("MPS " + mpsId + " cannot be converted from status " + mps.getStatus());
        }

        ProductionPlan plan = new ProductionPlan();
        plan.setPlanId("PLAN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        plan.setPostingDate(java.time.LocalDate.now());
        plan.setStatus("SUBMITTED");
        plan.setCreatedBy("MPS-Auto-Generator");
        plan.setItems(new ArrayList<>());

        ProductionPlanItem planItem = new ProductionPlanItem();
        planItem.setPlanId(plan.getPlanId());
        planItem.setItemCode(mps.getItemCode());
        planItem.setBomNo(mps.getBomNo());
        planItem.setPlannedQty(mps.getPlannedQty());
        planItem.setProducedQty(java.math.BigDecimal.ZERO);
        planItem.setSalesOrderRef(sourceReference);

        plan.getItems().add(planItem);

        StateTransitionAudit planAudit = new StateTransitionAudit();
        planAudit.setEntityType("PRODUCTION_PLAN");
        planAudit.setEntityId(plan.getPlanId());
        planAudit.setFromStatus("DRAFT");
        planAudit.setToStatus("SUBMITTED");
        planAudit.setAction("MPS_GENERATE_SUBMIT");
        stateTransitionAuditRepository.save(planAudit);

        mps.setStatus("COMPLETED");
        StateTransitionAudit completionAudit = new StateTransitionAudit();
        completionAudit.setEntityType("MPS");
        completionAudit.setEntityId(mpsId);
        completionAudit.setFromStatus("SUBMITTED");
        completionAudit.setToStatus("COMPLETED");
        completionAudit.setAction("CONVERT_TO_PRODUCTION_PLAN");
        stateTransitionAuditRepository.save(completionAudit);
        mpsRepository.save(mps);

        return productionPlanRepository.save(plan);
    }
}
