package com.nextgen.erp.stock.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;

@Entity
@Table(name = "serial_nos", schema = "stock")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SerialNo {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "serial_no", nullable = false, unique = true, length = 100)
    private String serialNo;

    @Column(name = "item_id", nullable = false, length = 64)
    private String itemId;

    @Column(name = "warehouse_id", length = 64)
    private String warehouseId;

    @Column(name = "batch_id", length = 64)
    private String batchId;

    @Column(length = 30)
    @Builder.Default
    private String status = "Active";

    @Column(name = "purchase_rate", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal purchaseRate = BigDecimal.ZERO;

    @Column(name = "warranty_expiry_date")
    private LocalDate warrantyExpiryDate;

    @Column(name = "created_at")
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private ZonedDateTime updatedAt = ZonedDateTime.now();
}
