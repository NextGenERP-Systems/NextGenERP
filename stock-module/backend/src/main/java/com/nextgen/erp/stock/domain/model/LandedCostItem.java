package com.nextgen.erp.stock.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "landed_cost_items", schema = "stock")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LandedCostItem {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id", nullable = false)
    @JsonIgnore
    private LandedCostVoucher voucher;

    @Column(name = "receipt_document_type", nullable = false, length = 50)
    private String receiptDocumentType; // 'Purchase Receipt', 'Stock Entry'

    @Column(name = "receipt_document_id", nullable = false, length = 64)
    private String receiptDocumentId;

    @Column(name = "item_id", nullable = false, length = 64)
    private String itemId;

    @Column(nullable = false, precision = 18, scale = 4)
    private BigDecimal qty;

    @Column(nullable = false, precision = 18, scale = 4)
    private BigDecimal rate;

    @Column(nullable = false, precision = 18, scale = 4)
    private BigDecimal amount;

    @Column(name = "applicable_charges", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal applicableCharges = BigDecimal.ZERO;

    @Column(name = "created_at")
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();
}
