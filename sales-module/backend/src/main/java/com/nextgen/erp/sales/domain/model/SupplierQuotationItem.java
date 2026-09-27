package com.nextgen.erp.sales.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "supplier_quotation_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierQuotationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_quotation_id", nullable = false)
    @JsonIgnore
    private SupplierQuotation supplierQuotation;

    @Column(name = "item_code", nullable = false, length = 100)
    private String itemCode;

    @Column(name = "item_name", nullable = false, length = 200)
    private String itemName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "qty", precision = 15, scale = 4, nullable = false)
    @Builder.Default
    private BigDecimal qty = BigDecimal.ONE;

    @Column(name = "uom", length = 30)
    @Builder.Default
    private String uom = "Nos";

    @Column(name = "rate", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal rate = BigDecimal.ZERO;

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(name = "amount", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "lead_time_days")
    @Builder.Default
    private Integer leadTimeDays = 7;
}
