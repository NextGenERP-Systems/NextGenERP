package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mrp_bom")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bom {

    @Id
    @Column(name = "bom_no", length = 100)
    private String bomNo;

    @Column(name = "item_code", nullable = false, length = 100)
    private String itemCode;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal quantity;

    @Column(length = 20)
    private String uom;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;

    @Column(name = "revision_number", nullable = false)
    @Builder.Default
    private Integer revisionNumber = 1;

    @Column(name = "routing_id", length = 100)
    private String routingId;

    @Column(name = "raw_material_cost", precision = 15, scale = 4)
    private BigDecimal rawMaterialCost;

    @Column(name = "operating_cost", precision = 15, scale = 4)
    private BigDecimal operatingCost;

    @Column(name = "scrap_cost", precision = 15, scale = 4)
    private BigDecimal scrapCost;

    @Column(name = "total_cost", precision = 15, scale = 4)
    private BigDecimal totalCost;

    @OneToMany(mappedBy = "bom", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BomItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "bom", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BomOperation> operations = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "bom_no")
    @Builder.Default
    private List<BomSecondaryItem> secondaryItems = new ArrayList<>();

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;

    public String getBomNo() { return bomNo; }
    public void setBomNo(String bomNo) { this.bomNo = bomNo; }

    public String getItemCode() { return itemCode; }
    public void setItemCode(String itemCode) { this.itemCode = itemCode; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public String getUom() { return uom; }
    public void setUom(String uom) { this.uom = uom; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }

    public Integer getRevisionNumber() { return revisionNumber; }
    public void setRevisionNumber(Integer revisionNumber) { this.revisionNumber = revisionNumber; }

    public String getRoutingId() { return routingId; }
    public void setRoutingId(String routingId) { this.routingId = routingId; }

    public BigDecimal getRawMaterialCost() { return rawMaterialCost; }
    public void setRawMaterialCost(BigDecimal rawMaterialCost) { this.rawMaterialCost = rawMaterialCost; }

    public BigDecimal getOperatingCost() { return operatingCost; }
    public void setOperatingCost(BigDecimal operatingCost) { this.operatingCost = operatingCost; }

    public BigDecimal getScrapCost() { return scrapCost; }
    public void setScrapCost(BigDecimal scrapCost) { this.scrapCost = scrapCost; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }

    public List<BomItem> getItems() { return items; }
    public void setItems(List<BomItem> items) { this.items = items; }

    public List<BomOperation> getOperations() { return operations; }
    public void setOperations(List<BomOperation> operations) { this.operations = operations; }

    public List<BomSecondaryItem> getSecondaryItems() { return secondaryItems; }
    public void setSecondaryItems(List<BomSecondaryItem> secondaryItems) { this.secondaryItems = secondaryItems; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
