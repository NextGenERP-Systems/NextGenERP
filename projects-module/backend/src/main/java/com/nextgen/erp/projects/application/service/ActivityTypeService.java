package com.nextgen.erp.projects.application.service;

import com.nextgen.erp.projects.domain.model.ActivityType;
import com.nextgen.erp.projects.infrastructure.repository.ActivityTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivityTypeService {

    private final ActivityTypeRepository activityTypeRepository;

    public List<ActivityType> getAllActivityTypes() {
        return activityTypeRepository.findAll();
    }

    @Transactional
    public ActivityType createActivityType(ActivityType activityType) {
        if (activityType.getName() == null || activityType.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Activity Type name cannot be empty");
        }
        if (activityType.getDefaultCostingRate() != null && activityType.getDefaultCostingRate().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Costing rate cannot be negative");
        }
        if (activityType.getDefaultBillingRate() != null && activityType.getDefaultBillingRate().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Billing rate cannot be negative");
        }
        return activityTypeRepository.save(activityType);
    }

    @Transactional
    public ActivityType updateActivityType(UUID id, ActivityType updatedType) {
        ActivityType existing = activityTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Activity Type not found"));
        
        if (updatedType.getName() == null || updatedType.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Activity Type name cannot be empty");
        }
        if (updatedType.getDefaultCostingRate() != null && updatedType.getDefaultCostingRate().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Costing rate cannot be negative");
        }
        if (updatedType.getDefaultBillingRate() != null && updatedType.getDefaultBillingRate().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Billing rate cannot be negative");
        }
        
        existing.setName(updatedType.getName());
        existing.setDescription(updatedType.getDescription());
        existing.setDefaultCostingRate(updatedType.getDefaultCostingRate());
        existing.setDefaultBillingRate(updatedType.getDefaultBillingRate());
        
        if (updatedType.getIsActive() != null) {
            existing.setIsActive(updatedType.getIsActive());
        }
        
        return activityTypeRepository.save(existing);
    }

    @Transactional
    public void deleteActivityType(UUID id) {
        ActivityType existing = activityTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Activity Type not found"));
        
        // Disable instead of delete if it is risky, or check references.
        // For now, allow deletion, but in a real scenario we'd check ActivityCost and TimesheetDetail.
        try {
            activityTypeRepository.delete(existing);
        } catch (Exception e) {
            throw new IllegalStateException("Cannot delete Activity Type. It might be referenced by Activity Costs or Timesheets. Disable it instead.");
        }
    }
}
