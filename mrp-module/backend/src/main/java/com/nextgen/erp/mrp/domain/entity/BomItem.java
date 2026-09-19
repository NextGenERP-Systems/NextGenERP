package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "mrp_bom_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BomItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bom_no", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Bom bom;

    @Column(name = "item_code", nullable = false, length = 100)
    private String itemCode;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal qty;

    @Column(length = 20)
    private String uom;

    @Column(name = "standard_rate", precision = 15, scale = 4)
    private BigDecimal standardRate;

    @Column(precision = 15, scale = 4)
    private BigDecimal amount;

    @Column(name = "sub_bom_no", length = 100)
    private String subBomNo;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Bom getBom() { return bom; }
    public void setBom(Bom bom) { this.bom = bom; }

    public String getItemCode() { return itemCode; }
    public void setItemCode(String itemCode) { this.itemCode = itemCode; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public BigDecimal getQty() { return qty; }
    public void setQty(BigDecimal qty) { this.qty = qty; }

    public String getUom() { return uom; }
    public void setUom(String uom) { this.uom = uom; }

    public BigDecimal getStandardRate() { return standardRate; }
    public void setStandardRate(BigDecimal standardRate) { this.standardRate = standardRate; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getSubBomNo() { return subBomNo; }
    public void setSubBomNo(String subBomNo) { this.subBomNo = subBomNo; }
}
