package com.nextgen.erp.sales.application.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerCreditAgingReportDto {
    private UUID customerId;
    private String customerCode;
    private String customerName;
    private String customerGroup;
    private BigDecimal creditLimit;
    private BigDecimal outstandingBalance;
    private BigDecimal availableCredit;
    private BigDecimal currentDue;     // 0-30 days
    private BigDecimal overdue31to60;  // 31-60 days
    private BigDecimal overdue61to90;  // 61-90 days
    private BigDecimal overdueAbove90; // >90 days
    private boolean creditExceeded;
}
