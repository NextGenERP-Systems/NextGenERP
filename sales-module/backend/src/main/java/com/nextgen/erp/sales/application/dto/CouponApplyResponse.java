package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.CouponDiscountType;
import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponApplyResponse {
    private boolean valid;
    private String couponCode;
    private String couponName;
    private CouponDiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal calculatedDiscountAmount;
    private BigDecimal finalAmount;
    private String message;
}
