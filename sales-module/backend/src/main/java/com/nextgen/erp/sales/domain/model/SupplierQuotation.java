package com.nextgen.erp.sales.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "supplier_quotations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SupplierQuotation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "quotation_number", nullable = false, unique = true, length = 50)
    private String quotationNumber;

    @Column(name = "supplier_id")
    private UUID supplierId;

    @Column(name = "supplier_name", nullable = false, length = 150)
    private String supplierName;

    @Column(name = "material_request_id")
    private UUID materialRequestId;

    @Column(name = "material_request_number", length = 50)
    private String materialRequestNumber;

    @Column(name = "transaction_date", nullable = false)
    @Builder.Default
    private LocalDate transactionDate = LocalDate.now();

    @Column(name = "valid_till")
    private LocalDate validTill;

    @Column(name = "currency", length = 10)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "exchange_rate", precision = 10, scale = 4)
    @Builder.Default
    private BigDecimal exchangeRate = BigDecimal.ONE;

    @Column(name = "net_total", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal netTotal = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "grand_total", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private QuotationStatus status = QuotationStatus.DRAFT;

    @Column(name = "lead_time_days")
    @Builder.Default
    private Integer leadTimeDays = 7;

    @Column(name = "quality_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal qualityRating = BigDecimal.valueOf(4.50);

    @Column(name = "payment_terms", length = 100)
    @Builder.Default
    private String paymentTerms = "Net 30 Days";

    @Column(name = "terms_and_conditions", columnDefinition = "TEXT")
    private String termsAndConditions;

    @OneToMany(mappedBy = "supplierQuotation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SupplierQuotationItem> items = new ArrayList<>();

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public enum QuotationStatus {
        DRAFT,
        SUBMITTED,
        ACCEPTED,
        REJECTED,
        ORDERED,
        EXPIRED
    }
}
