package com.nextgen.erp.accounting.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "fixed_assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "asset_code", unique = true, nullable = false, length = 50)
    private String assetCode;

    @Column(name = "asset_name", nullable = false, length = 150)
    private String assetName;

    @Column(name = "asset_category", nullable = false, length = 100)
    private String assetCategory; // IT Hardware, Cloud Servers, Office Equipment, Furniture, Vehicles

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @Column(name = "gross_purchase_amount", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal grossPurchaseAmount = BigDecimal.ZERO;

    @Column(name = "useful_life_years")
    @Builder.Default
    private Integer usefulLifeYears = 3;

    @Column(name = "depreciation_method", length = 50)
    @Builder.Default
    private String depreciationMethod = "STRAIGHT_LINE"; // STRAIGHT_LINE, WRITTEN_DOWN_VALUE

    @Column(name = "accumulated_depreciation", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal accumulatedDepreciation = BigDecimal.ZERO;

    @Column(name = "net_book_value", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal netBookValue = BigDecimal.ZERO;

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "IN_SERVICE"; // IN_SERVICE, FULLY_DEPRECIATED, DISPOSED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
