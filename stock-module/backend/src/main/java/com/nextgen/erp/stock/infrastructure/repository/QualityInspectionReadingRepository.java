package com.nextgen.erp.stock.infrastructure.repository;

import com.nextgen.erp.stock.domain.model.QualityInspectionReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QualityInspectionReadingRepository extends JpaRepository<QualityInspectionReading, String> {
    List<QualityInspectionReading> findByInspectionId(String inspectionId);
}
