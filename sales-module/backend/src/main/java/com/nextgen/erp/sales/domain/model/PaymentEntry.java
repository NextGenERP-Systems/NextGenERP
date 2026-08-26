package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "payment_number", nullable = false, unique = true, length = 100)
    private String paymentNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false, length = 50)
    @Builder.Default
    private PaymentType paymentType = PaymentType.RECEIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", nullable = false, length = 50)
    @Builder.Default
    private PaymentMode paymentMode = PaymentMode.BANK_TRANSFER;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "sales_invoice_id")
    private UUID salesInvoiceId;

    @Column(name = "sales_order_id")
    private UUID salesOrderId;

    @Column(name = "posting_date", nullable = false)
    @Builder.Default
    private LocalDate postingDate = LocalDate.now();

    @Column(name = "paid_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal paidAmount;

    @Column(name = "reference_no", length = 100)
    private String referenceNo;

    @Column(name = "reference_date")
    @Builder.Default
    private LocalDate referenceDate = LocalDate.now();

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
