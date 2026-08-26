package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.PaymentMode;
import com.nextgen.erp.sales.domain.model.PaymentType;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEntryCreateRequest {
    private PaymentType paymentType;
    private PaymentMode paymentMode;
    @NotNull(message = "Customer ID is required")
    private UUID customerId;
    private UUID salesInvoiceId;
    private UUID salesOrderId;
    private LocalDate postingDate;
    @NotNull(message = "Paid amount is required")
    private BigDecimal paidAmount;
    private String referenceNo;
    private LocalDate referenceDate;
    private String notes;
}
