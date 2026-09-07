package com.nextgen.erp.projects.application.service;

import com.nextgen.erp.projects.domain.model.ActivityCost;
import com.nextgen.erp.projects.infrastructure.repository.ActivityCostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivityCostService {

    private final ActivityCostRepository activityCostRepository;

    public List<ActivityCost> getAllActivityCosts() {
        return activityCostRepository.findAll();
    }

    @Transactional
    public ActivityCost createActivityCost(ActivityCost activityCost) {
        if (activityCost.getEmployeeId() == null) {
            throw new IllegalArgumentException("Employee is required");
        }
        if (activityCost.getActivityType() == null || activityCost.getActivityType().getId() == null) {
            throw new IllegalArgumentException("Activity Type is required");
        }
        if (activityCost.getCostingRate() != null && activityCost.getCostingRate().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Costing rate cannot be negative");
        }
        if (activityCost.getBillingRate() != null && activityCost.getBillingRate().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Billing rate cannot be negative");
        }

        Optional<ActivityCost> existing = activityCostRepository.findByEmployeeIdAndActivityType_Id(
                activityCost.getEmployeeId(), activityCost.getActivityType().getId());
        if (existing.isPresent()) {
            throw new IllegalStateException("An Activity Cost already exists for this employee and activity type");
        }

        return activityCostRepository.save(activityCost);
    }

    @Transactional
    public ActivityCost updateActivityCost(UUID id, ActivityCost updatedCost) {
        ActivityCost existing = activityCostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Activity Cost not found"));

        if (updatedCost.getCostingRate() != null && updatedCost.getCostingRate().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Costing rate cannot be negative");
        }
        if (updatedCost.getBillingRate() != null && updatedCost.getBillingRate().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Billing rate cannot be negative");
        }

        // We do not allow changing employee or activity type for an existing cost, just the rates.
        existing.setCostingRate(updatedCost.getCostingRate());
        existing.setBillingRate(updatedCost.getBillingRate());

        return activityCostRepository.save(existing);
    }

    @Transactional
    public void deleteActivityCost(UUID id) {
        ActivityCost existing = activityCostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Activity Cost not found"));
        activityCostRepository.delete(existing);
    }
}
