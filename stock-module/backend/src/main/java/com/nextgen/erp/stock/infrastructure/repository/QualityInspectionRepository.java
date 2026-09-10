package com.nextgen.erp.stock.infrastructure.repository;

import com.nextgen.erp.stock.domain.model.QualityInspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QualityInspectionRepository extends JpaRepository<QualityInspection, String> {
    Optional<QualityInspection> findByInspectionNumber(String inspectionNumber);
    List<QualityInspection> findByItemId(String itemId);
    List<QualityInspection> findByReferenceTypeAndReferenceId(String referenceType, String referenceId);
}
