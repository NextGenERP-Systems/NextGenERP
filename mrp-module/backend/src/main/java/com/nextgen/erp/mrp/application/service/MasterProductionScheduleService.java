package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.*;
import com.nextgen.erp.mrp.domain.repository.BomRepository;
import com.nextgen.erp.mrp.domain.repository.MasterProductionScheduleRepository;
import com.nextgen.erp.mrp.domain.repository.MockItemRepository;
import com.nextgen.erp.mrp.domain.repository.ProductionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MasterProductionScheduleService {

    private final MasterProductionScheduleRepository mpsRepository;
    private final ProductionPlanRepository productionPlanRepository;
    private final MockItemRepository mockItemRepository;
    private final BomRepository bomRepository;

    @Transactional(readOnly = true)
    public List<MasterProductionSchedule> getAllSchedules() {
        return mpsRepository.findAll();
    }

    @Transactional
    public MasterProductionSchedule createSchedule(MasterProductionSchedule mps) {
        if (mps.getMpsId() == null || mps.getMpsId().isBlank()) {
            mps.setMpsId("MPS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        // Auto-create missing MockItem if it doesn't exist to prevent FK constraint failure
        if (mps.getItemCode() != null && !mps.getItemCode().isBlank()) {
            if (!mockItemRepository.existsById(mps.getItemCode())) {
                MockItem item = new MockItem();
                item.setItemCode(mps.getItemCode());
                item.setItemName(mps.getItemCode());
                item.setItemGroup("Products");
                item.setUom("Nos");
                item.setStandardRate(BigDecimal.ZERO);
                item.setIsStockItem(true);
                mockItemRepository.saveAndFlush(item);
            }
        }

        // Auto-create missing Bom if it doesn't exist to prevent FK constraint failure
        if (mps.getBomNo() != null && !mps.getBomNo().isBlank()) {
            if (!bomRepository.existsById(mps.getBomNo())) {
                Bom bom = new Bom();
                bom.setBomNo(mps.getBomNo());
                bom.setItemCode(mps.getItemCode() != null ? mps.getItemCode() : "GENERIC-ITEM");
                bom.setItemName(mps.getItemCode() != null ? mps.getItemCode() : "Generic Item");
                bom.setQuantity(BigDecimal.ONE);
                bom.setUom("Nos");
                bom.setIsActive(true);
                bom.setIsDefault(true);
                bom.setRevisionNumber(1);
                bom.setRawMaterialCost(BigDecimal.ZERO);
                bom.setOperatingCost(BigDecimal.ZERO);
                bom.setScrapCost(BigDecimal.ZERO);
                bom.setTotalCost(BigDecimal.ZERO);
                bomRepository.saveAndFlush(bom);
            }
        }

        return mpsRepository.save(mps);
    }

    @Transactional
    public ProductionPlan convertMpsToProductionPlan(String mpsId) {
        MasterProductionSchedule mps = mpsRepository.findById(mpsId)
                .orElseThrow(() -> new IllegalArgumentException("MPS record not found with ID: " + mpsId));

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
        planItem.setSalesOrderRef("MPS:" + mps.getMpsId());

        plan.getItems().add(planItem);

        mps.setStatus("COMPLETED");
        mpsRepository.save(mps);

        return productionPlanRepository.save(plan);
    }
}
