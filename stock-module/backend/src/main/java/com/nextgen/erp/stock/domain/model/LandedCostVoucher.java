package com.nextgen.erp.stock.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;

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
    private String distributeChargesBasedOn = "Amount";

    @Column(name = "total_taxes_and_charges", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal totalTaxesAndCharges = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
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
}
