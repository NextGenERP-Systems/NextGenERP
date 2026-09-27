package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.TargetType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesTargetCreateRequest {

    @NotNull(message = "Target type is required")
    private TargetType targetType;

    @NotNull(message = "Target reference ID is required")
    private UUID targetRefId;

    private String targetRefName;

    @Builder.Default
    private String fiscalYear = "2026";

    @Builder.Default
    private String period = "ANNUAL"; // MONTHLY, QUARTERLY, ANNUAL

    private UUID itemGroupId;
    private String itemGroupName;

    @NotNull(message = "Target amount is required")
    private BigDecimal targetAmount;

    @Builder.Default
    private BigDecimal targetQty = BigDecimal.ZERO;
}
