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
public class SalesPartnerPayoutDto {
    private UUID id;
    private String payoutNumber;
    private UUID salesPartnerId;
    private String salesPartnerName;
    private LocalDate postingDate;
    private BigDecimal amount;
    private String referenceNote;
    private String paymentMode;
    private OffsetDateTime createdAt;
}
