package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "item_code", nullable = false, unique = true, length = 100)
    private String itemCode;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "item_group", nullable = false, length = 100)
    @Builder.Default
    private String itemGroup = "Products";

    @Column(name = "stock_uom", nullable = false, length = 20)
    @Builder.Default
    private String stockUom = "Nos";

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "is_stock_item")
    @Builder.Default
    private Boolean isStockItem = true;

    @Column(name = "is_sales_item")
    @Builder.Default
    private Boolean isSalesItem = true;

    @Column(name = "is_purchase_item")
    @Builder.Default
    private Boolean isPurchaseItem = true;

    @Column(name = "is_fixed_asset")
    @Builder.Default
    private Boolean isFixedAsset = false;

    @Column(name = "allow_alternative_item")
    @Builder.Default
    private Boolean allowAlternativeItem = false;

    @Column(name = "has_variants")
    @Builder.Default
    private Boolean hasVariants = false;

    @Column(name = "standard_rate", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal standardRate = BigDecimal.ZERO;

    @Column(name = "last_purchase_rate", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal lastPurchaseRate = BigDecimal.ZERO;

    @Column(name = "valuation_rate", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal valuationRate = BigDecimal.ZERO;

    @Column(name = "valuation_method", length = 50)
    @Builder.Default
    private String valuationMethod = "FIFO";

    @Column(name = "max_discount", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal maxDiscount = new BigDecimal("20.00");

    @Column(name = "has_serial_no")
    @Builder.Default
    private Boolean hasSerialNo = false;

    @Column(name = "has_batch_no")
    @Builder.Default
    private Boolean hasBatchNo = false;

    @Column(name = "has_expiry_date")
    @Builder.Default
    private Boolean hasExpiryDate = false;

    @Column(name = "shelf_life_in_days")
    @Builder.Default
    private Integer shelfLifeInDays = 0;

    @Column(name = "warranty_period", length = 100)
    private String warrantyPeriod;

    @Column(name = "weight_per_unit", precision = 10, scale = 4)
    @Builder.Default
    private BigDecimal weightPerUnit = BigDecimal.ZERO;

    @Column(name = "weight_uom", length = 20)
    @Builder.Default
    private String weightUom = "Kg";

    @Column(name = "min_order_qty", precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal minOrderQty = BigDecimal.ZERO;

    @Column(name = "safety_stock", precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal safetyStock = BigDecimal.ZERO;

    @Column(name = "lead_time_days")
    @Builder.Default
    private Integer leadTimeDays = 0;

    @Column(length = 100)
    private String brand;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String barcode;

    @Column
    @Builder.Default
    private Boolean disabled = false;

    @Column(name = "default_warehouse", length = 150)
    private String defaultWarehouse;

    @Column(name = "default_income_account", length = 150)
    private String defaultIncomeAccount;

    @Column(name = "default_expense_account", length = 150)
    private String defaultExpenseAccount;

    @Column(name = "default_supplier", length = 150)
    private String defaultSupplier;

    @Column(name = "delivered_by_supplier")
    @Builder.Default
    private Boolean deliveredBySupplier = false;

    @Column(name = "grant_commission")
    @Builder.Default
    private Boolean grantCommission = true;

    @Column(name = "enable_deferred_revenue")
    @Builder.Default
    private Boolean enableDeferredRevenue = false;

    @Column(name = "enable_deferred_expense")
    @Builder.Default
    private Boolean enableDeferredExpense = false;

    @Column(name = "include_item_in_manufacturing")
    @Builder.Default
    private Boolean includeItemInManufacturing = true;

    @Column(name = "is_sub_contracted_item")
    @Builder.Default
    private Boolean isSubContractedItem = false;

    @Column(name = "default_bom", length = 100)
    private String defaultBom;

    @Column(name = "production_capacity", precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal productionCapacity = BigDecimal.ZERO;

    @Column(name = "inspection_required_before_purchase")
    @Builder.Default
    private Boolean inspectionRequiredBeforePurchase = false;

    @Column(name = "inspection_required_before_delivery")
    @Builder.Default
    private Boolean inspectionRequiredBeforeDelivery = false;

    @Column(name = "quality_inspection_template", length = 150)
    private String qualityInspectionTemplate;

    @Column(name = "variant_based_on", length = 100)
    @Builder.Default
    private String variantBasedOn = "Item Attribute";

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
