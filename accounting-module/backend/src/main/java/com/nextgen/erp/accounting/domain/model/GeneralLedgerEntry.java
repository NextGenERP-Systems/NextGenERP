package com.nextgen.erp.accounting.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nextgen.erp.accounting.domain.model.Enums.PartyType;
import com.nextgen.erp.accounting.domain.model.Enums.VoucherType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "general_ledger_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class GeneralLedgerEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "posting_date", nullable = false)
    @Builder.Default
    private LocalDate postingDate = LocalDate.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(name = "voucher_type", nullable = false, length = 50)
    private VoucherType voucherType;

    @Column(name = "voucher_number", nullable = false, length = 50)
    private String voucherNumber;

    @Column(name = "voucher_id", nullable = false)
    private UUID voucherId;

    @Column(name = "debit", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal debit = BigDecimal.ZERO;

    @Column(name = "credit", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal credit = BigDecimal.ZERO;

    @Column(name = "against_account", length = 150)
    private String againstAccount;

    @Enumerated(EnumType.STRING)
    @Column(name = "party_type", length = 50)
    private PartyType partyType;

    @Column(name = "party_name", length = 150)
    private String partyName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cost_center_id")
    private CostCenter costCenter;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "is_cancelled")
    @Builder.Default
    private Boolean isCancelled = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
