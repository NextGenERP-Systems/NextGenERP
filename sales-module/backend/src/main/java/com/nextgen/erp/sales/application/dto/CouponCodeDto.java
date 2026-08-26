package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.CouponDiscountType;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponCodeDto {
    private UUID id;
    private String couponName;
    private String couponCode;
    private CouponDiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private LocalDate validUpto;
    private int usedCount;
    private int maxUses;
    private boolean active;
    private OffsetDateTime createdAt;
}
