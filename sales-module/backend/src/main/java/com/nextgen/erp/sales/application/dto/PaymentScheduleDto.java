package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.PaymentSchedule;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentScheduleDto {
    private UUID id;
    private String voucherType;
    private UUID voucherId;
    private String paymentTerm;
    private String description;
    private LocalDate dueDate;
    private BigDecimal invoicePortion; // % e.g. 30.00
    private BigDecimal paymentAmount;
    private BigDecimal paidAmount;
    private BigDecimal outstandingAmount;
    private PaymentSchedule.ScheduleStatus status;
    private UUID salesInvoiceId;
    private String salesInvoiceNumber;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
