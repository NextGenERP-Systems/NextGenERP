package com.nextgen.erp.sales.domain.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "packing_slip_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackingSlipItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "packing_slip_id", nullable = false)
    @JsonBackReference
    private PackingSlip packingSlip;

    @Column(name = "delivery_note_item_id")
    private UUID deliveryNoteItemId;

    @Column(name = "item_code", nullable = false, length = 100)
    private String itemCode;

    @Column(name = "item_name", nullable = false, length = 255)
    private String itemName;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal qty = BigDecimal.ONE;

    @Column(name = "net_weight", precision = 12, scale = 3)
    @Builder.Default
    private BigDecimal netWeight = BigDecimal.ZERO;

    @Column(name = "weight_uom", length = 20)
    @Builder.Default
    private String weightUom = "Kg";

    @Column(name = "product_bundle_item_code", length = 100)
    private String productBundleItemCode;
}
