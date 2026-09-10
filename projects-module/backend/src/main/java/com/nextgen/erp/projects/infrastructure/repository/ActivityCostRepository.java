package com.nextgen.erp.projects.infrastructure.repository;

import com.nextgen.erp.projects.domain.model.ActivityCost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import java.util.Optional;

@Repository
public interface ActivityCostRepository extends JpaRepository<ActivityCost, UUID> {
    Optional<ActivityCost> findByEmployeeIdAndActivityType_Id(UUID employeeId, UUID activityTypeId);
}
