package com.nextgen.erp.stock.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stock_entries", schema = "stock")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockEntry {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "entry_number", nullable = false, unique = true, length = 100)
    private String entryNumber;

    @Convert(converter = StockEntryPurpose.StockEntryPurposeConverter.class)
    @Column(nullable = false, length = 50)
    private StockEntryPurpose purpose;

    @Column(name = "posting_date", nullable = false)
    private LocalDate postingDate;

    @Column(name = "posting_time", nullable = false)
    private LocalTime postingTime;

    @Column(name = "from_warehouse_id", length = 64)
    private String fromWarehouseId;

    @Column(name = "to_warehouse_id", length = 64)
    private String toWarehouseId;

    @Column(name = "total_incoming_value", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal totalIncomingValue = BigDecimal.ZERO;

    @Column(name = "total_outgoing_value", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal totalOutgoingValue = BigDecimal.ZERO;

    @Column(name = "value_difference", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal valueDifference = BigDecimal.ZERO;

    @Column(name = "additional_costs", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal additionalCosts = BigDecimal.ZERO;

    @Column(name = "work_order_id", length = 64)
    private String workOrderId;

    @Column(name = "bom_id", length = 64)
    private String bomId;

    @Convert(converter = StockEntryStatus.StockEntryStatusConverter.class)
    @Column(length = 30)
    @Builder.Default
    private StockEntryStatus status = StockEntryStatus.DRAFT;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_by", length = 100)
    @Builder.Default
    private String createdBy = "system";

    @Column(name = "created_at")
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    @OneToMany(mappedBy = "stockEntry", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<StockEntryItem> items = new ArrayList<>();
}
