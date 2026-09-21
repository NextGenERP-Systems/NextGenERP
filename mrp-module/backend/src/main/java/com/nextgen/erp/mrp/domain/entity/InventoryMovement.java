package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "mrp_inventory_movement")
@Getter
@Setter
@NoArgsConstructor
public class InventoryMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "item_code", nullable = false, length = 100)
    private String itemCode;

    @Column(name = "warehouse_id", length = 100)
    private String warehouseId;

    @Column(name = "quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal quantity;

    @Column(name = "movement_type", nullable = false, length = 50)
    private String movementType;

    @Column(name = "work_order_id", length = 100)
    private String workOrderId;

    @Column(name = "source_reference", nullable = false, length = 150)
    private String sourceReference;

    @Column(name = "created_at", nullable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();
}
