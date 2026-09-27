package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.TargetType;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TargetVarianceReportDto {
    private UUID targetRefId;
    private String targetRefName;
    private TargetType targetType;
    private String fiscalYear;
    private String period;
    private BigDecimal targetAmount;
    private BigDecimal achievedAmount;
    private BigDecimal varianceAmount;
    private BigDecimal percentageAchieved;
    private String pacingStatus; // EXCEEDED, ON_TRACK, AT_RISK, BEHIND
    private Integer totalDealsBooked;
}
