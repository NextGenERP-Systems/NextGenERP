package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "sales_taxes_and_charges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesTaxAndCharge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "voucher_type", nullable = false, length = 50)
    private String voucherType; // 'Quotation', 'Sales Order'

    @Column(name = "voucher_id", nullable = false)
    private UUID voucherId;

    @Column(nullable = false)
    private Integer idx;

    @Enumerated(EnumType.STRING)
    @Column(name = "charge_type", nullable = false)
    @Builder.Default
    private TaxChargeType chargeType = TaxChargeType.ON_NET_TOTAL;

    @Column(name = "row_id")
    private Integer rowId;

    @Column(name = "account_head", nullable = false, length = 150)
    private String accountHead;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, precision = 8, scale = 4)
    @Builder.Default
    private BigDecimal rate = BigDecimal.ZERO;

    @Column(name = "tax_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "base_tax_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal baseTaxAmount = BigDecimal.ZERO;

    @Column(name = "base_total", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal baseTotal = BigDecimal.ZERO;
}
