package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.PricingRuleApplyOn;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingRuleDto {
    private UUID id;
    private String title;
    private PricingRuleApplyOn applyOn;
    private String applyKeyId;
    private BigDecimal minQty;
    private BigDecimal discountPercentage;
    private BigDecimal discountAmount;
    private boolean isFreeItem;
    private String freeItemCode;
    private BigDecimal freeQty;
    private LocalDate validFrom;
    private LocalDate validUpto;
    private boolean active;
    private OffsetDateTime createdAt;
}
