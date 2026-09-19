package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "mrp_scrap_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScrapItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "work_order_id", nullable = false)
    private String workOrderId;

    @Column(name = "item_code", nullable = false)
    private String itemCode;

    @Column(name = "scrap_qty", nullable = false, precision = 15, scale = 4)
    private BigDecimal scrapQty;

    @Column(name = "uom", nullable = false)
    private String uom;

    @Column(name = "financial_valuation", nullable = false, precision = 15, scale = 4)
    private BigDecimal financialValuation;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getWorkOrderId() { return workOrderId; }
    public void setWorkOrderId(String workOrderId) { this.workOrderId = workOrderId; }

    public String getItemCode() { return itemCode; }
    public void setItemCode(String itemCode) { this.itemCode = itemCode; }

    public BigDecimal getScrapQty() { return scrapQty; }
    public void setScrapQty(BigDecimal scrapQty) { this.scrapQty = scrapQty; }

    public String getUom() { return uom; }
    public void setUom(String uom) { this.uom = uom; }

    public BigDecimal getFinancialValuation() { return financialValuation; }
    public void setFinancialValuation(BigDecimal financialValuation) { this.financialValuation = financialValuation; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
