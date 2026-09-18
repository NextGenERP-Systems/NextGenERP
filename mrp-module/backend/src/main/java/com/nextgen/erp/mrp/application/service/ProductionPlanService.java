package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.ProductionPlan;
import com.nextgen.erp.mrp.domain.entity.ProductionPlanItem;
import com.nextgen.erp.mrp.domain.repository.ProductionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionPlanService {

    private final ProductionPlanRepository productionPlanRepository;

    @Transactional(readOnly = true)
    public List<ProductionPlan> getAllPlans() {
        return productionPlanRepository.findAll();
    }

    @Transactional(readOnly = true)
    public ProductionPlan getPlanById(String planId) {
        return productionPlanRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("Production Plan not found: " + planId));
    }

    @Transactional
    public ProductionPlan createProductionPlan(ProductionPlan plan) {
        if (plan.getPostingDate() == null) {
            plan.setPostingDate(LocalDate.now());
        }
        if (plan.getCreatedAt() == null) {
            plan.setCreatedAt(ZonedDateTime.now());
        }
        if (plan.getStatus() == null) {
            plan.setStatus("DRAFT");
        }
        if (plan.getItems() != null) {
            for (ProductionPlanItem item : plan.getItems()) {
                item.setPlanId(plan.getPlanId());
            }
        }
        return productionPlanRepository.save(plan);
    }

    @Transactional
    public ProductionPlan submitProductionPlan(String planId) {
        ProductionPlan plan = getPlanById(planId);
        plan.setStatus("SUBMITTED");
        return productionPlanRepository.save(plan);
    }
}
