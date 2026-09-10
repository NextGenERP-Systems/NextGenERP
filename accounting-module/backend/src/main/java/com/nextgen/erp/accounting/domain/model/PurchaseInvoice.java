package com.nextgen.erp.accounting.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nextgen.erp.accounting.domain.model.Enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "purchase_invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PurchaseInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "bill_number", unique = true, nullable = false, length = 50)
    private String billNumber;

    @Column(name = "supplier_name", nullable = false, length = 150)
    private String supplierName;

    @Column(name = "supplier_email", length = 150)
    private String supplierEmail;

    @Column(name = "supplier_gstin", length = 50)
    private String supplierGstin;

    @Column(name = "posting_date", nullable = false)
    @Builder.Default
    private LocalDate postingDate = LocalDate.now();

    @Column(name = "due_date", nullable = false)
    @Builder.Default
    private LocalDate dueDate = LocalDate.now().plusDays(30);

    @Column(name = "subtotal", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "total_tax", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal totalTax = BigDecimal.ZERO;

    @Column(name = "grand_total", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(name = "outstanding_amount", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal outstandingAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private InvoiceStatus status = InvoiceStatus.SUBMITTED;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @OneToMany(mappedBy = "purchaseInvoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<PurchaseInvoiceItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public void addItem(PurchaseInvoiceItem item) {
        items.add(item);
        item.setPurchaseInvoice(this);
    }
}
