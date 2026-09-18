package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.QualityInspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QualityInspectionRepository extends JpaRepository<QualityInspection, String> {

    List<QualityInspection> findByWorkOrderId(String workOrderId);
}
