package com.nextgen.erp.accounting.infrastructure.repository;

import com.nextgen.erp.accounting.domain.model.CostCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CostCenterRepository extends JpaRepository<CostCenter, UUID> {
    Optional<CostCenter> findByCostCenterCode(String costCenterCode);
}
