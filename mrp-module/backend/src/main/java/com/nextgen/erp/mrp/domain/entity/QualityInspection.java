package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mrp_quality_inspection")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QualityInspection {

    @Id
    @Column(name = "inspection_id", nullable = false)
    private String inspectionId;

    @Column(name = "work_order_id", nullable = false)
    private String workOrderId;

    @Column(name = "inspection_type", nullable = false)
    private String inspectionType;

    @Column(name = "inspected_by", nullable = false)
    private String inspectedBy;

    @Column(name = "inspected_qty", nullable = false, precision = 15, scale = 4)
    private BigDecimal inspectedQty;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "remarks")
    private String remarks;

    @Column(name = "inspection_date")
    private ZonedDateTime inspectionDate;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "inspection_id")
    @Builder.Default
    private List<QualityInspectionReading> readings = new ArrayList<>();

    public String getInspectionId() { return inspectionId; }
    public void setInspectionId(String inspectionId) { this.inspectionId = inspectionId; }

    public String getWorkOrderId() { return workOrderId; }
    public void setWorkOrderId(String workOrderId) { this.workOrderId = workOrderId; }

    public String getInspectionType() { return inspectionType; }
    public void setInspectionType(String inspectionType) { this.inspectionType = inspectionType; }

    public String getInspectedBy() { return inspectedBy; }
    public void setInspectedBy(String inspectedBy) { this.inspectedBy = inspectedBy; }

    public BigDecimal getInspectedQty() { return inspectedQty; }
    public void setInspectedQty(BigDecimal inspectedQty) { this.inspectedQty = inspectedQty; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public ZonedDateTime getInspectionDate() { return inspectionDate; }
    public void setInspectionDate(ZonedDateTime inspectionDate) { this.inspectionDate = inspectionDate; }

    public List<QualityInspectionReading> getReadings() { return readings; }
    public void setReadings(List<QualityInspectionReading> readings) { this.readings = readings; }
}
