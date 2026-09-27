package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.TargetType;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesTargetDto {
    private UUID id;
    private TargetType targetType;
    private UUID targetRefId;
    private String targetRefName;
    private String fiscalYear;
    private String period;
    private UUID itemGroupId;
    private String itemGroupName;
    private BigDecimal targetAmount;
    private BigDecimal targetQty;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
