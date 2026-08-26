package com.nextgen.erp.sales.application.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAcquisitionReportDto {
    private UUID customerId;
    private String customerCode;
    private String customerName;
    private String customerGroup;
    private String territory;
    private String firstOrderDate;
    private String lastOrderDate;
    private long totalOrdersCount;
    private BigDecimal lifetimeValue;
    private String loyaltySegment; // "VIP Key Account", "Regular", "New Prospect", "Inactive / Churn Risk"
}
