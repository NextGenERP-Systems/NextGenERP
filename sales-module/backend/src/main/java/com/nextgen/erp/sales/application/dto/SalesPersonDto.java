package com.nextgen.erp.sales.application.dto;

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
public class SalesPersonDto {
    private UUID id;
    private String salesPersonName;
    private String employeeId;
    private String email;
    private String phone;
    private String parentSalesPerson;
    private BigDecimal commissionRate;
    private BigDecimal targetAmount;
    private BigDecimal allocatedAmount;
    private BigDecimal incentivesEarned;
    private Boolean disabled;
    private OffsetDateTime createdAt;
}
