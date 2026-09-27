package com.nextgen.erp.stock.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "quality_inspection_readings", schema = "stock")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QualityInspectionReading {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id", nullable = false)
    @JsonIgnore
    private QualityInspection inspection;

    @Column(name = "parameter_name", nullable = false, length = 150)
    private String parameterName;

    @Column(columnDefinition = "TEXT")
    private String specification;

    @Column(name = "min_value", precision = 18, scale = 4)
    private BigDecimal minValue;

    @Column(name = "max_value", precision = 18, scale = 4)
    private BigDecimal maxValue;

    @Column(name = "reading_value", precision = 18, scale = 4)
    private BigDecimal readingValue;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private InspectionStatus status = InspectionStatus.ACCEPTED;

    @Column(name = "created_at")
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();
}
