package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "mrp_quality_inspection_reading")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QualityInspectionReading {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "inspection_id", nullable = false)
    private String inspectionId;

    @Column(name = "parameter_name", nullable = false)
    private String parameterName;

    @Column(name = "reading_value", nullable = false, precision = 15, scale = 4)
    private BigDecimal readingValue;

    @Column(name = "status", nullable = false)
    private String status;
}
