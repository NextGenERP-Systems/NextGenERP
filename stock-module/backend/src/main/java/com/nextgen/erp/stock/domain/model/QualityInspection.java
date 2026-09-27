package com.nextgen.erp.stock.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quality_inspections", schema = "stock")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QualityInspection {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "inspection_number", nullable = false, unique = true, length = 100)
    private String inspectionNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "inspection_type", nullable = false, length = 30)
    private InspectionType inspectionType;

    @Column(name = "reference_type", nullable = false, length = 50)
    private String referenceType;

    @Column(name = "reference_id", nullable = false, length = 64)
    private String referenceId;

    @Column(name = "item_id", nullable = false, length = 64)
    private String itemId;

    @Column(name = "sample_size", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal sampleSize = BigDecimal.ONE;

    @Column(name = "inspection_date", nullable = false)
    private LocalDate inspectionDate;

    @Column(length = 100)
    private String inspector;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private InspectionStatus status = InspectionStatus.ACCEPTED;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at")
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    @OneToMany(mappedBy = "inspection", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<QualityInspectionReading> readings = new ArrayList<>();
}
