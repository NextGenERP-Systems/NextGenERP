package com.nextgen.erp.stock.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "landed_cost_vouchers", schema = "stock")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LandedCostVoucher {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "voucher_number", nullable = false, unique = true, length = 100)
    private String voucherNumber;

    @Column(name = "posting_date", nullable = false)
    private LocalDate postingDate;

    @Column(name = "distribute_charges_based_on", length = 30)
    @Builder.Default
    private String distributeChargesBasedOn = "Amount"; // 'Amount', 'Qty', 'Distribute Manually'

    @Column(name = "total_taxes_and_charges", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal totalTaxesAndCharges = BigDecimal.ZERO;

    @Convert(converter = StockEntryStatus.StockEntryStatusConverter.class)
    @Column(length = 30)
    @Builder.Default
    private StockEntryStatus status = StockEntryStatus.DRAFT;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at")
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<LandedCostItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<LandedCostTax> taxes = new ArrayList<>();
}
