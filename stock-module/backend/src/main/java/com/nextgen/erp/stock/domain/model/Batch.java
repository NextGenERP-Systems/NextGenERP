package com.nextgen.erp.stock.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;

@Entity
@Table(name = "batches", schema = "stock")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Batch {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "batch_id", nullable = false, unique = true, length = 100)
    private String batchId;

    @Column(name = "item_id", nullable = false, length = 64)
    private String itemId;

    @Column(name = "manufacturing_date")
    private LocalDate manufacturingDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "batch_qty", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal batchQty = BigDecimal.ZERO;

    @Column(name = "supplier_batch_no", length = 100)
    private String supplierBatchNo;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_disabled")
    @Builder.Default
    private Boolean isDisabled = false;

    @Column(name = "created_at")
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private ZonedDateTime updatedAt = ZonedDateTime.now();
}
