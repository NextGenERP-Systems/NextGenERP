package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "mrp_mock_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockItem {

    @Id
    @Column(name = "item_code", length = 100)
    private String itemCode;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "item_group", nullable = false)
    @Builder.Default
    private String itemGroup = "Products";

    @Column(name = "uom", nullable = false, length = 20)
    @Builder.Default
    private String uom = "Nos";

    @Column(name = "standard_rate", precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal standardRate = BigDecimal.ZERO;

    @Column(name = "is_stock_item", nullable = false)
    @Builder.Default
    private Boolean isStockItem = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;

    public String getItemCode() { return itemCode; }
    public void setItemCode(String itemCode) { this.itemCode = itemCode; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getItemGroup() { return itemGroup; }
    public void setItemGroup(String itemGroup) { this.itemGroup = itemGroup; }

    public String getUom() { return uom; }
    public void setUom(String uom) { this.uom = uom; }

    public BigDecimal getStandardRate() { return standardRate; }
    public void setStandardRate(BigDecimal standardRate) { this.standardRate = standardRate; }

    public Boolean getIsStockItem() { return isStockItem; }
    public void setIsStockItem(Boolean isStockItem) { this.isStockItem = isStockItem; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
