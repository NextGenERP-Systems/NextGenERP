package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.ProductionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ProductionPlanRepository extends JpaRepository<ProductionPlan, String> {

    java.util.List<ProductionPlan> findAllByOrderByCreatedAtDesc();

    ProductionPlan findFirstByItemsSalesOrderRef(String salesOrderRef);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ProductionPlan> findByPlanId(String planId);

    Optional<ProductionPlan> findBySourceMrpRunId(UUID sourceMrpRunId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM ProductionPlan p WHERE p.planId = :planId")
    Optional<ProductionPlan> findByPlanIdForUpdate(@Param("planId") String planId);
}
