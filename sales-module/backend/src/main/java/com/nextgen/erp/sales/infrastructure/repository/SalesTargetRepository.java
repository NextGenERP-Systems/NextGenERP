package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.SalesTarget;
import com.nextgen.erp.sales.domain.model.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalesTargetRepository extends JpaRepository<SalesTarget, UUID> {

    List<SalesTarget> findByTargetTypeAndFiscalYear(TargetType targetType, String fiscalYear);

    List<SalesTarget> findByFiscalYear(String fiscalYear);

    Optional<SalesTarget> findByTargetTypeAndTargetRefIdAndFiscalYear(
            TargetType targetType, UUID targetRefId, String fiscalYear);
}
