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
@Table(name = "quotations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "quotation_number", nullable = false, unique = true, length = 50)
    private String quotationNumber;

    @Column(name = "transaction_date", nullable = false)
    @Builder.Default
    private LocalDate transactionDate = LocalDate.now();

    @Column(name = "valid_till")
    private LocalDate validTill;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type")
    @Builder.Default
    private OrderType orderType = OrderType.SALES;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private QuotationStatus status = QuotationStatus.DRAFT;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "conversion_rate", precision = 12, scale = 6)
    @Builder.Default
    private BigDecimal conversionRate = BigDecimal.ONE;

    @Column(name = "selling_price_list_id")
    private UUID sellingPriceListId;

    @Column(name = "total_qty", precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal totalQty = BigDecimal.ZERO;

    @Column(name = "net_total", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal netTotal = BigDecimal.ZERO;

    @Column(name = "base_net_total", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal baseNetTotal = BigDecimal.ZERO;

    @Column(name = "total_taxes_and_charges", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalTaxesAndCharges = BigDecimal.ZERO;

    @Column(name = "base_total_taxes_and_charges", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal baseTotalTaxesAndCharges = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "additional_discount_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal additionalDiscountPercentage = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "apply_discount_on")
    @Builder.Default
    private DiscountApplyOn applyDiscountOn = DiscountApplyOn.GRAND_TOTAL;

    @Column(name = "grand_total", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(name = "base_grand_total", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal baseGrandTotal = BigDecimal.ZERO;

    @Column(name = "payment_terms_template", length = 100)
    private String paymentTermsTemplate;

    @Column(name = "terms_and_conditions", columnDefinition = "TEXT")
    private String termsAndConditions;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "lost_reason", length = 100)
    private QuotationLostReason lostReason;

    @Column(name = "competitor_name", length = 150)
    private String competitorName;

    @Column(name = "opportunity_id")
    private UUID opportunityId;

    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<QuotationItem> items = new ArrayList<>();

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @Column(name = "created_by", length = 100)
    @Builder.Default
    private String createdBy = "system";

    @Version
    private Integer version;
}
