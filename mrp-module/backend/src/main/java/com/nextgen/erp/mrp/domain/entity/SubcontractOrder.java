package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "mrp_subcontract_order")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubcontractOrder {

    @Id
    @Column(name = "subcontract_id", length = 100)
    private String subcontractId;

    @Column(name = "work_order_id", nullable = false, length = 100)
    private String workOrderId;

    @Column(name = "supplier_id", nullable = false, length = 100)
    private String supplierId;

    @Column(name = "item_code", nullable = false, length = 100)
    private String itemCode;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal qty;

    @Column(name = "service_cost", precision = 15, scale = 4)
    private BigDecimal serviceCost;

    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "DRAFT";

    @Column(name = "warehouse_from", length = 100)
    @Builder.Default
    private String warehouseFrom = "WH-STORES";

    @Column(name = "warehouse_to", length = 100)
    @Builder.Default
    private String warehouseTo = "WH-SUBCONTRACTOR";

    @Column(name = "materials_dispatched")
    @Builder.Default
    private Boolean materialsDispatched = false;

    @Column(name = "dispatch_date")
    private ZonedDateTime dispatchDate;

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;

    public String getSubcontractId() { return subcontractId; }
    public void setSubcontractId(String subcontractId) { this.subcontractId = subcontractId; }

    public String getWorkOrderId() { return workOrderId; }
    public void setWorkOrderId(String workOrderId) { this.workOrderId = workOrderId; }

    public String getSupplierId() { return supplierId; }
    public void setSupplierId(String supplierId) { this.supplierId = supplierId; }

    public String getItemCode() { return itemCode; }
    public void setItemCode(String itemCode) { this.itemCode = itemCode; }

    public BigDecimal getQty() { return qty; }
    public void setQty(BigDecimal qty) { this.qty = qty; }

    public BigDecimal getServiceCost() { return serviceCost; }
    public void setServiceCost(BigDecimal serviceCost) { this.serviceCost = serviceCost; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getWarehouseFrom() { return warehouseFrom; }
    public void setWarehouseFrom(String warehouseFrom) { this.warehouseFrom = warehouseFrom; }

    public String getWarehouseTo() { return warehouseTo; }
    public void setWarehouseTo(String warehouseTo) { this.warehouseTo = warehouseTo; }

    public Boolean getMaterialsDispatched() { return materialsDispatched; }
    public void setMaterialsDispatched(Boolean materialsDispatched) { this.materialsDispatched = materialsDispatched; }

    public ZonedDateTime getDispatchDate() { return dispatchDate; }
    public void setDispatchDate(ZonedDateTime dispatchDate) { this.dispatchDate = dispatchDate; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
