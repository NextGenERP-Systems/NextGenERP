package com.nextgen.erp.sales.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GlEntryDto {
    private UUID id;
    private LocalDate postingDate;
    private String voucherType;
    private String voucherNo;
    private UUID voucherId;
    private String account;
    private BigDecimal debit;
    private BigDecimal credit;
    private UUID customerId;
    private String customerName;
    private String remarks;
    private boolean cancelled;
    private OffsetDateTime createdAt;
}
