package com.nextgen.erp.sales.application.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesPartnerPayoutCreateRequest {

    @NotNull(message = "Sales Partner ID is required")
    private UUID salesPartnerId;

    @NotNull(message = "Payout amount is required")
    @DecimalMin(value = "0.01", message = "Payout amount must be greater than zero")
    private BigDecimal amount;

    private LocalDate postingDate;

    private String referenceNote;

    @Builder.Default
    private String paymentMode = "Bank Transfer";
}
