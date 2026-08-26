package com.nextgen.erp.sales.application.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesOrderAnalysisReportDto {
    private UUID orderId;
    private String orderNumber;
    private LocalDate transactionDate;
    private String customerName;
    private String status;
    private BigDecimal grandTotal;
    private BigDecimal deliveredPercentage;
    private BigDecimal billedPercentage;
    private BigDecimal deliveredAmount;
    private BigDecimal billedAmount;
    private BigDecimal pendingDeliveryAmount;
    private BigDecimal pendingBillingAmount;
    private String deliveryStatus;
    private String billingStatus;
}
