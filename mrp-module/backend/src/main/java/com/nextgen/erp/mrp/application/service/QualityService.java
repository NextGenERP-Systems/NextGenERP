package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.QualityInspection;
import com.nextgen.erp.mrp.domain.entity.QualityInspectionReading;
import com.nextgen.erp.mrp.domain.repository.QualityInspectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QualityService {

    private final QualityInspectionRepository qualityInspectionRepository;

    @Transactional(readOnly = true)
    public List<QualityInspection> getAllInspections() {
        return qualityInspectionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public QualityInspection getInspectionById(String id) {
        return qualityInspectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Quality Inspection not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<QualityInspection> getInspectionsByWorkOrder(String workOrderId) {
        return qualityInspectionRepository.findByWorkOrderId(workOrderId);
    }

    @Transactional
    public QualityInspection createInspection(QualityInspection inspection) {
        if (inspection.getInspectionDate() == null) {
            inspection.setInspectionDate(ZonedDateTime.now());
        }

        boolean anyFailed = false;
        if (inspection.getReadings() != null) {
            for (QualityInspectionReading reading : inspection.getReadings()) {
                reading.setInspectionId(inspection.getInspectionId());
                if ("FAILED".equalsIgnoreCase(reading.getStatus())) {
                    anyFailed = true;
                }
            }
        }

        inspection.setStatus(anyFailed ? "FAILED" : "PASSED");
        return qualityInspectionRepository.save(inspection);
    }
}
