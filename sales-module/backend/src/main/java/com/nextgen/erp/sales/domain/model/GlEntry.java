package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "gl_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GlEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "posting_date", nullable = false)
    private LocalDate postingDate;

    @Column(name = "voucher_type", nullable = false)
    private String voucherType; // "Sales Invoice", "Payment Entry", "Journal Entry"

    @Column(name = "voucher_no", nullable = false)
    private String voucherNo;

    @Column(name = "voucher_id")
    private UUID voucherId;

    @Column(name = "account", nullable = false)
    private String account; // e.g. "1310 - Debtors / Accounts Receivable", "4110 - Sales Revenue", "2210 - Tax Payable", "1110 - Bank Account"

    @Column(name = "debit", nullable = false)
    @Builder.Default
    private BigDecimal debit = BigDecimal.ZERO;

    @Column(name = "credit", nullable = false)
    @Builder.Default
    private BigDecimal credit = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "remarks")
    private String remarks;

    @Column(name = "is_cancelled", nullable = false)
    @Builder.Default
    private boolean cancelled = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
