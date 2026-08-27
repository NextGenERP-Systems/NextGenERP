package com.nextgen.erp.sales.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesPartnerCreateRequest {
    @NotBlank(message = "Partner name is required")
    private String partnerName;

    @Builder.Default
    private String partnerType = "Channel Partner";

    @Builder.Default
    private BigDecimal commissionRate = new BigDecimal("5.00");

    @Builder.Default
    private String currency = "INR";

    private String contactPerson;
    private String email;
    private String phone;

    @Builder.Default
    private String territory = "Global";
}
