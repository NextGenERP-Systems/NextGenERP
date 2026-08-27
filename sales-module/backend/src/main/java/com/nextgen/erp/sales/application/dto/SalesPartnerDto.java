package com.nextgen.erp.sales.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesPartnerDto {
    private UUID id;
    private String partnerName;
    private String partnerType;
    private BigDecimal commissionRate;
    private String currency;
    private String contactPerson;
    private String email;
    private String phone;
    private String territory;
    private BigDecimal totalAllocatedAmount;
    private BigDecimal totalCommissionEarned;
    private Boolean disabled;
    private OffsetDateTime createdAt;
}
