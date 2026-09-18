package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.ProductionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductionPlanRepository extends JpaRepository<ProductionPlan, String> {
}
