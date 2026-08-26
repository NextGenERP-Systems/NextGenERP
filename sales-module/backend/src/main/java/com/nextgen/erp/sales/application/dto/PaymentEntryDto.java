package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.PaymentMode;
import com.nextgen.erp.sales.domain.model.PaymentType;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEntryDto {
    private UUID id;
    private String paymentNumber;
    private PaymentType paymentType;
    private PaymentMode paymentMode;
    private UUID customerId;
    private String customerName;
    private UUID salesInvoiceId;
    private UUID salesOrderId;
    private LocalDate postingDate;
    private BigDecimal paidAmount;
    private String referenceNo;
    private LocalDate referenceDate;
    private String notes;
    private OffsetDateTime createdAt;
}
