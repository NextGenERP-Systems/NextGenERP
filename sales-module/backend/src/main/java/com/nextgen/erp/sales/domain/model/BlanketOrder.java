package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "blanket_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlanketOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "blanket_order_number", nullable = false, unique = true, length = 50)
    private String blanketOrderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "from_date", nullable = false)
    private LocalDate fromDate;

    @Column(name = "to_date", nullable = false)
    private LocalDate toDate;

    @Column(name = "company", length = 150)
    @Builder.Default
    private String company = "NextGen ERP Corp";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private BlanketOrderStatus status = BlanketOrderStatus.ACTIVE;

    @Column(name = "terms_and_conditions", columnDefinition = "TEXT")
    private String termsAndConditions;

    @OneToMany(mappedBy = "blanketOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BlanketOrderItem> items = new ArrayList<>();

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public void recalculateFulfillment() {
        if (this.status == BlanketOrderStatus.CLOSED) {
            return;
        }
        if (this.toDate != null && this.toDate.isBefore(LocalDate.now())) {
            this.status = BlanketOrderStatus.EXPIRED;
            return;
        }
        if (this.items == null || this.items.isEmpty()) {
            return;
        }
        BigDecimal totalQty = BigDecimal.ZERO;
        BigDecimal totalOrdered = BigDecimal.ZERO;
        for (BlanketOrderItem item : this.items) {
            totalQty = totalQty.add(item.getQty() != null ? item.getQty() : BigDecimal.ZERO);
            totalOrdered = totalOrdered.add(item.getOrderedQty() != null ? item.getOrderedQty() : BigDecimal.ZERO);
        }
        if (totalQty.compareTo(BigDecimal.ZERO) > 0 && totalOrdered.compareTo(totalQty) >= 0) {
            this.status = BlanketOrderStatus.COMPLETED;
        } else if (totalOrdered.compareTo(BigDecimal.ZERO) > 0) {
            this.status = BlanketOrderStatus.PARTIALLY_ORDERED;
        } else {
            this.status = BlanketOrderStatus.ACTIVE;
        }
        this.updatedAt = OffsetDateTime.now();
    }

    public enum BlanketOrderStatus {
        DRAFT,
        ACTIVE,
        PARTIALLY_ORDERED,
        COMPLETED,
        EXPIRED,
        CLOSED
    }
}
