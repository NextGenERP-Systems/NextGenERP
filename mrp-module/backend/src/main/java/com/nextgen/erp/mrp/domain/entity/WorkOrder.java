package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mrp_work_order")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrder {

    @Id
    @Column(name = "work_order_id", length = 100)
    private String workOrderId;

    @Column(name = "parent_wo_id", length = 100)
    private String parentWoId;

    @Column(name = "production_item", nullable = false, length = 100)
    private String productionItem;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "bom_no", nullable = false, length = 100)
    private String bomNo;

    @Column(name = "qty_to_produce", nullable = false, precision = 15, scale = 4)
    private BigDecimal qtyToProduce;

    @Column(name = "produced_qty", precision = 15, scale = 4)
    private BigDecimal producedQty;

    @Column(name = "source_warehouse", length = 100)
    private String sourceWarehouse;

    @Column(name = "wip_warehouse", length = 100)
    private String wipWarehouse;

    @Column(name = "fg_warehouse", length = 100)
    private String fgWarehouse;

    @Column(name = "planned_start_date", nullable = false)
    private ZonedDateTime plannedStartDate;

    @Column(name = "planned_end_date", nullable = false)
    private ZonedDateTime plannedEndDate;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "planned_material_cost", precision = 15, scale = 4)
    private BigDecimal plannedMaterialCost;

    @Column(name = "actual_material_cost", precision = 15, scale = 4)
    private BigDecimal actualMaterialCost;

    @Column(name = "planned_operating_cost", precision = 15, scale = 4)
    private BigDecimal plannedOperatingCost;

    @Column(name = "actual_operating_cost", precision = 15, scale = 4)
    private BigDecimal actualOperatingCost;

    @Version
    private Integer version;

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WorkOrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WorkOrderOperation> operations = new ArrayList<>();

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;

    public String getWorkOrderId() { return workOrderId; }
    public void setWorkOrderId(String workOrderId) { this.workOrderId = workOrderId; }

    public String getParentWoId() { return parentWoId; }
    public void setParentWoId(String parentWoId) { this.parentWoId = parentWoId; }

    public String getProductionItem() { return productionItem; }
    public void setProductionItem(String productionItem) { this.productionItem = productionItem; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getBomNo() { return bomNo; }
    public void setBomNo(String bomNo) { this.bomNo = bomNo; }

    public BigDecimal getQtyToProduce() { return qtyToProduce; }
    public void setQtyToProduce(BigDecimal qtyToProduce) { this.qtyToProduce = qtyToProduce; }

    public BigDecimal getProducedQty() { return producedQty; }
    public void setProducedQty(BigDecimal producedQty) { this.producedQty = producedQty; }

    public String getSourceWarehouse() { return sourceWarehouse; }
    public void setSourceWarehouse(String sourceWarehouse) { this.sourceWarehouse = sourceWarehouse; }

    public String getWipWarehouse() { return wipWarehouse; }
    public void setWipWarehouse(String wipWarehouse) { this.wipWarehouse = wipWarehouse; }

    public String getFgWarehouse() { return fgWarehouse; }
    public void setFgWarehouse(String fgWarehouse) { this.fgWarehouse = fgWarehouse; }

    public ZonedDateTime getPlannedStartDate() { return plannedStartDate; }
    public void setPlannedStartDate(ZonedDateTime plannedStartDate) { this.plannedStartDate = plannedStartDate; }

    public ZonedDateTime getPlannedEndDate() { return plannedEndDate; }
    public void setPlannedEndDate(ZonedDateTime plannedEndDate) { this.plannedEndDate = plannedEndDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getPlannedMaterialCost() { return plannedMaterialCost; }
    public void setPlannedMaterialCost(BigDecimal plannedMaterialCost) { this.plannedMaterialCost = plannedMaterialCost; }

    public BigDecimal getActualMaterialCost() { return actualMaterialCost; }
    public void setActualMaterialCost(BigDecimal actualMaterialCost) { this.actualMaterialCost = actualMaterialCost; }

    public BigDecimal getPlannedOperatingCost() { return plannedOperatingCost; }
    public void setPlannedOperatingCost(BigDecimal plannedOperatingCost) { this.plannedOperatingCost = plannedOperatingCost; }

    public BigDecimal getActualOperatingCost() { return actualOperatingCost; }
    public void setActualOperatingCost(BigDecimal actualOperatingCost) { this.actualOperatingCost = actualOperatingCost; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public List<WorkOrderItem> getItems() { return items; }
    public void setItems(List<WorkOrderItem> items) { this.items = items; }

    public List<WorkOrderOperation> getOperations() { return operations; }
    public void setOperations(List<WorkOrderOperation> operations) { this.operations = operations; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
