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
public class SalesPersonCreateRequest {
    @NotBlank(message = "Sales Person Name is required")
    private String salesPersonName;

    private String employeeId;
    private String email;
    private String phone;
    private String parentSalesPerson;

    @Builder.Default
    private BigDecimal commissionRate = new BigDecimal("4.50");

    @Builder.Default
    private BigDecimal targetAmount = new BigDecimal("500000.00");
}
