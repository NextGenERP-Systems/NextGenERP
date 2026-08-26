package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_order_id", nullable = false)
    private SalesOrder salesOrder;

    @Column(name = "payment_term", nullable = false, length = 100)
    private String paymentTerm;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "invoice_portion", nullable = false, precision = 5, scale = 2)
    private BigDecimal invoicePortion;

    @Column(name = "payment_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal paymentAmount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal outstanding;

    @Column(name = "paid_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;
}
