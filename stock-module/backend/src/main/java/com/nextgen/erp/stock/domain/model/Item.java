package com.nextgen.erp.stock.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "items", schema = "stock")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Item {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "item_code", nullable = false, unique = true, length = 100)
    private String itemCode;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "item_group_id", length = 64)
    private String itemGroupId;

    @Column(name = "stock_uom", nullable = false, length = 64)
    private String stockUom;

    @Column(name = "is_stock_item")
    @Builder.Default
    private Boolean isStockItem = true;

    @Convert(converter = ValuationMethod.ValuationMethodConverter.class)
    @Column(name = "valuation_method", length = 30)
    @Builder.Default
    private ValuationMethod valuationMethod = ValuationMethod.FIFO;

    @Column(name = "standard_rate", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal standardRate = BigDecimal.ZERO;

    @Column(name = "opening_stock", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal openingStock = BigDecimal.ZERO;

    @Column(name = "safety_stock", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal safetyStock = BigDecimal.ZERO;

    @Column(name = "lead_time_days")
    @Builder.Default
    private Integer leadTimeDays = 0;

    @Column(name = "has_variants")
    @Builder.Default
    private Boolean hasVariants = false;

    @Column(name = "variant_of", length = 64)
    private String variantOf;

    @Column(name = "has_batch_no")
    @Builder.Default
    private Boolean hasBatchNo = false;

    @Column(name = "has_serial_no")
    @Builder.Default
    private Boolean hasSerialNo = false;

    @Column(name = "inspection_required_before_receipt")
    @Builder.Default
    private Boolean inspectionRequiredBeforeReceipt = false;

    @Column(name = "inspection_required_before_delivery")
    @Builder.Default
    private Boolean inspectionRequiredBeforeDelivery = false;

    @Column(name = "default_warehouse_id", length = 64)
    private String defaultWarehouseId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String barcode;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Builder.Default
    private Boolean enabled = true;

    @Column(name = "created_at")
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private ZonedDateTime updatedAt = ZonedDateTime.now();
}
