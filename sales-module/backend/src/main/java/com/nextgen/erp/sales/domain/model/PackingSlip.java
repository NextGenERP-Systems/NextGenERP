package com.nextgen.erp.sales.domain.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "packing_slips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackingSlip {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "packing_slip_number", nullable = false, unique = true, length = 100)
    private String packingSlipNumber;

    @Column(name = "delivery_note_id", nullable = false)
    private UUID deliveryNoteId;

    @Column(name = "delivery_note_number", nullable = false, length = 100)
    private String deliveryNoteNumber;

    @Column(name = "from_package_no", nullable = false)
    @Builder.Default
    private Integer fromPackageNo = 1;

    @Column(name = "to_package_no", nullable = false)
    @Builder.Default
    private Integer toPackageNo = 1;

    @Column(name = "package_type", nullable = false, length = 50)
    @Builder.Default
    private String packageType = "Carton";

    @Column(name = "net_weight_pkg", precision = 12, scale = 3)
    @Builder.Default
    private BigDecimal netWeightPkg = BigDecimal.ZERO;

    @Column(name = "gross_weight_pkg", precision = 12, scale = 3)
    @Builder.Default
    private BigDecimal grossWeightPkg = BigDecimal.ZERO;

    @Column(name = "weight_uom", length = 20)
    @Builder.Default
    private String weightUom = "Kg";

    @Column(name = "letter_of_credit", length = 100)
    private String letterOfCredit;

    @Column(name = "shipping_mark", columnDefinition = "TEXT")
    private String shippingMark;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private PackingSlipStatus status = PackingSlipStatus.DRAFT;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "packingSlip", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    @Builder.Default
    private List<PackingSlipItem> items = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @PrePersist
    public void onPrePersist() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    public void onPreUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public void addItem(PackingSlipItem item) {
        items.add(item);
        item.setPackingSlip(this);
    }
}
