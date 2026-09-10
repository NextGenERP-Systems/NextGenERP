package com.nextgen.erp.stock.application.dto;

import com.nextgen.erp.stock.domain.model.InspectionStatus;
import com.nextgen.erp.stock.domain.model.InspectionType;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QualityInspectionDto {
    private String id;
    private String inspectionNumber;
    private InspectionType inspectionType;
    private String referenceType;
    private String referenceId;
    private String itemId;
    private String itemCode;
    private String itemName;
    private BigDecimal sampleSize;
    private LocalDate inspectionDate;
    private String inspector;
    private InspectionStatus status;
    private String remarks;
}
