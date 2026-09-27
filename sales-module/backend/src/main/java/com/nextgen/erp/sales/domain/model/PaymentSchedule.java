package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment_schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "voucher_type", nullable = false, length = 50)
    private String voucherType; // SALES_ORDER, QUOTATION, SALES_INVOICE

    @Column(name = "voucher_id", nullable = false)
    private UUID voucherId;

    @Column(name = "payment_term", nullable = false, length = 150)
    private String paymentTerm;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "invoice_portion", nullable = false, precision = 5, scale = 2)
    private BigDecimal invoicePortion; // e.g. 30.00 (%)

    @Column(name = "payment_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal paymentAmount = BigDecimal.ZERO;

    @Column(name = "paid_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "outstanding_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal outstandingAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private ScheduleStatus status = ScheduleStatus.UNPAID;

    @Column(name = "sales_invoice_id")
    private UUID salesInvoiceId;

    @Column(name = "sales_invoice_number", length = 100)
    private String salesInvoiceNumber;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public enum ScheduleStatus {
        UNPAID,
        INVOICED,
        PARTIALLY_PAID,
        PAID
    }
}
