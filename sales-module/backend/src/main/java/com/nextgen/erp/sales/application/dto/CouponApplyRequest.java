package com.nextgen.erp.sales.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponApplyRequest {
    @NotBlank(message = "Coupon code is required")
    private String couponCode;
    @NotNull(message = "Order amount is required")
    private BigDecimal orderAmount;
}
