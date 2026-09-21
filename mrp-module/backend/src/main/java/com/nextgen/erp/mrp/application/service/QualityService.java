package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.QualityInspection;
import com.nextgen.erp.mrp.domain.entity.QualityInspectionReading;
import com.nextgen.erp.mrp.domain.repository.QualityInspectionRepository;
import com.nextgen.erp.mrp.domain.repository.StateTransitionAuditRepository;
import com.nextgen.erp.mrp.domain.entity.StateTransitionAudit;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QualityService {

    private final QualityInspectionRepository qualityInspectionRepository;
    private final StateTransitionAuditRepository stateTransitionAuditRepository;

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
        if (inspection.getInspectedQty() == null || inspection.getInspectedQty().signum() <= 0) {
            throw new IllegalArgumentException("Inspected quantity must be greater than zero");
        }
        if (inspection.getReadings() == null || inspection.getReadings().isEmpty()) {
            throw new IllegalArgumentException("At least one quality reading is required");
        }
        if (inspection.getInspectionDate() == null) {
            inspection.setInspectionDate(ZonedDateTime.now());
        }

        boolean anyFailed = false;
        boolean anyPending = false;
        for (QualityInspectionReading reading : inspection.getReadings()) {
            if (reading == null || reading.getParameterName() == null || reading.getParameterName().isBlank()) {
                throw new IllegalArgumentException("Quality reading parameter name is required");
            }
            if (reading.getReadingValue() == null) {
                throw new IllegalArgumentException("Quality reading value is required");
            }
            if (reading.getStatus() == null ||
                    !("PASSED".equalsIgnoreCase(reading.getStatus())
                            || "FAILED".equalsIgnoreCase(reading.getStatus())
                            || "PENDING".equalsIgnoreCase(reading.getStatus()))) {
                throw new IllegalArgumentException("Quality reading status must be PASSED, FAILED, or PENDING");
            }
            reading.setInspectionId(inspection.getInspectionId());
            reading.setStatus(reading.getStatus().toUpperCase());
            anyFailed |= "FAILED".equals(reading.getStatus());
            anyPending |= "PENDING".equals(reading.getStatus());
        }

        inspection.setStatus(anyFailed ? "FAILED" : anyPending ? "PENDING" : "PASSED");
        StateTransitionAudit audit = new StateTransitionAudit();
        audit.setEntityType("QUALITY_INSPECTION");
        audit.setEntityId(inspection.getInspectionId());
        audit.setToStatus(inspection.getStatus());
        audit.setAction("CREATE");
        stateTransitionAuditRepository.save(audit);
        return qualityInspectionRepository.save(inspection);
    }
}
