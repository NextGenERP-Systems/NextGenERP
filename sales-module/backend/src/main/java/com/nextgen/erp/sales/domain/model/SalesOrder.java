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
@Table(name = "sales_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @Column(name = "transaction_date", nullable = false)
    @Builder.Default
    private LocalDate transactionDate = LocalDate.now();

    @Column(name = "delivery_date", nullable = false)
    private LocalDate deliveryDate;

    @Column(name = "po_no", length = 100)
    private String poNo;

    @Column(name = "po_date")
    private LocalDate poDate;

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
    private SalesOrderStatus status = SalesOrderStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", nullable = false)
    @Builder.Default
    private DeliveryStatus deliveryStatus = DeliveryStatus.NOT_DELIVERED;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_status", nullable = false)
    @Builder.Default
    private BillingStatus billingStatus = BillingStatus.NOT_BILLED;

    @Column(name = "quotation_id")
    private UUID quotationId;

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

    @Column(name = "total_net_weight", precision = 12, scale = 4)
    @Builder.Default
    private BigDecimal totalNetWeight = BigDecimal.ZERO;

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

    @Column(name = "advance_paid", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal advancePaid = BigDecimal.ZERO;

    @Column(name = "per_delivered", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal perDelivered = BigDecimal.ZERO;

    @Column(name = "per_billed", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal perBilled = BigDecimal.ZERO;

    @Column(name = "per_picked", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal perPicked = BigDecimal.ZERO;

    @Column(name = "reserve_stock")
    @Builder.Default
    private Boolean reserveStock = false;

    @Column(name = "skip_delivery_note")
    @Builder.Default
    private Boolean skipDeliveryNote = false;

    @Column(name = "payment_terms_template", length = 100)
    private String paymentTermsTemplate;

    @Column(name = "terms_and_conditions", columnDefinition = "TEXT")
    private String termsAndConditions;

    @Column(name = "amount_eligible_for_commission", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal amountEligibleForCommission = BigDecimal.ZERO;

    @Column(name = "commission_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal commissionRate = BigDecimal.ZERO;

    @Column(name = "total_commission", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalCommission = BigDecimal.ZERO;

    @OneToMany(mappedBy = "salesOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SalesOrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "salesOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PaymentSchedule> paymentSchedules = new ArrayList<>();

    @OneToMany(mappedBy = "salesOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StockReservation> stockReservations = new ArrayList<>();

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @Column(name = "created_by", length = 100)
    @Builder.Default
    private String createdBy = "system";

    @Version
    private Integer version;

    public void recalculateStatuses() {
        if (this.status == SalesOrderStatus.CANCELLED || this.status == SalesOrderStatus.CLOSED || this.status == SalesOrderStatus.DRAFT) {
            return;
        }

        boolean fullyDelivered = perDelivered.compareTo(new BigDecimal("100.00")) >= 0;
        boolean fullyBilled = perBilled.compareTo(new BigDecimal("100.00")) >= 0;

        if (fullyDelivered && fullyBilled) {
            this.status = SalesOrderStatus.COMPLETED;
            this.deliveryStatus = DeliveryStatus.FULLY_DELIVERED;
            this.billingStatus = BillingStatus.FULLY_BILLED;
        } else if (fullyDelivered) {
            this.status = SalesOrderStatus.TO_BILL;
            this.deliveryStatus = DeliveryStatus.FULLY_DELIVERED;
            this.billingStatus = perBilled.compareTo(BigDecimal.ZERO) > 0 ? BillingStatus.PARTLY_BILLED : BillingStatus.NOT_BILLED;
        } else if (fullyBilled) {
            this.status = SalesOrderStatus.TO_DELIVER;
            this.billingStatus = BillingStatus.FULLY_BILLED;
            this.deliveryStatus = perDelivered.compareTo(BigDecimal.ZERO) > 0 ? DeliveryStatus.PARTLY_DELIVERED : DeliveryStatus.NOT_DELIVERED;
        } else {
            this.status = SalesOrderStatus.TO_DELIVER_AND_BILL;
            this.deliveryStatus = perDelivered.compareTo(BigDecimal.ZERO) > 0 ? DeliveryStatus.PARTLY_DELIVERED : DeliveryStatus.NOT_DELIVERED;
            this.billingStatus = perBilled.compareTo(BigDecimal.ZERO) > 0 ? BillingStatus.PARTLY_BILLED : BillingStatus.NOT_BILLED;
        }
    }
}
