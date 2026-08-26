package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.PricingRuleApplyOn;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingRuleCreateRequest {
    @NotBlank(message = "Title is required")
    private String title;
    @NotNull(message = "ApplyOn is required")
    private PricingRuleApplyOn applyOn;
    @NotBlank(message = "Apply key is required")
    private String applyKeyId;
    private BigDecimal minQty;
    private BigDecimal discountPercentage;
    private BigDecimal discountAmount;
    private boolean isFreeItem;
    private String freeItemCode;
    private BigDecimal freeQty;
    private LocalDate validFrom;
    private LocalDate validUpto;
    private Boolean active;
}
