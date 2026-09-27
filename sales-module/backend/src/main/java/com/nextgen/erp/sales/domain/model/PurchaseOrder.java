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
@Table(name = "purchase_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "po_number", nullable = false, unique = true, length = 50)
    private String poNumber;

    @Column(name = "supplier_id")
    private UUID supplierId;

    @Column(name = "supplier_name", nullable = false, length = 150)
    private String supplierName;

    @Column(name = "supplier_quotation_id")
    private UUID supplierQuotationId;

    @Column(name = "supplier_quotation_number", length = 50)
    private String supplierQuotationNumber;

    @Column(name = "material_request_id")
    private UUID materialRequestId;

    @Column(name = "material_request_number", length = 50)
    private String materialRequestNumber;

    @Column(name = "transaction_date", nullable = false)
    @Builder.Default
    private LocalDate transactionDate = LocalDate.now();

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

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
    private PurchaseOrderStatus status = PurchaseOrderStatus.DRAFT;

    @Column(name = "billing_status", length = 30)
    @Builder.Default
    private String billingStatus = "Not Billed"; // Not Billed, Fully Billed, Partly Billed

    @Column(name = "receipt_status", length = 30)
    @Builder.Default
    private String receiptStatus = "Not Received"; // Not Received, Fully Received, Partly Received

    @Column(name = "payment_terms", length = 100)
    @Builder.Default
    private String paymentTerms = "Net 30 Days";

    @Column(name = "shipping_address", columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "billing_address", columnDefinition = "TEXT")
    private String billingAddress;

    @Column(name = "target_warehouse", length = 100)
    @Builder.Default
    private String targetWarehouse = "Stores - Primary";

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PurchaseOrderItem> items = new ArrayList<>();

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public enum PurchaseOrderStatus {
        DRAFT,
        SUBMITTED,
        TO_RECEIVE_AND_BILL,
        TO_RECEIVE,
        TO_BILL,
        COMPLETED,
        CANCELLED,
        ON_HOLD
    }
}
