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
@Table(name = "stock_reconciliations", schema = "stock")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockReconciliation {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "reconciliation_number", nullable = false, unique = true, length = 100)
    private String reconciliationNumber;

    @Column(name = "posting_date", nullable = false)
    private LocalDate postingDate;

    @Column(name = "posting_time", nullable = false)
    private LocalTime postingTime;

    @Column(length = 50)
    @Builder.Default
    private String purpose = "Stock Reconciliation";

    @Convert(converter = StockEntryStatus.StockEntryStatusConverter.class)
    @Column(length = 30)
    @Builder.Default
    private StockEntryStatus status = StockEntryStatus.DRAFT;

    @Column(name = "difference_amount", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal differenceAmount = BigDecimal.ZERO;

    @Column(name = "expense_account", length = 100)
    @Builder.Default
    private String expenseAccount = "Stock Adjustment - NC";

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at")
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    @OneToMany(mappedBy = "reconciliation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<StockReconciliationItem> items = new ArrayList<>();
}
