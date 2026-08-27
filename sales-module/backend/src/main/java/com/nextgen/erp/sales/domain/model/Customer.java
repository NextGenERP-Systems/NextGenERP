package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "customer_code", nullable = false, unique = true, length = 50)
    private String customerCode;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type", nullable = false)
    @Builder.Default
    private CustomerType customerType = CustomerType.COMPANY;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_group_id")
    private CustomerGroup customerGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "territory_id")
    private Territory territory;

    @Column(name = "default_currency", length = 3)
    @Builder.Default
    private String defaultCurrency = "INR";

    @Column(name = "tax_id", length = 50)
    private String taxId;

    @Column(name = "default_price_list_id")
    private UUID defaultPriceListId;

    @Column(name = "payment_terms", length = 100)
    private String paymentTerms;

    @Column(name = "is_internal_customer")
    @Builder.Default
    private Boolean isInternalCustomer = false;

    @Column(name = "represents_company", length = 100)
    private String representsCompany;

    @Column(name = "credit_limit", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal creditLimit = new BigDecimal("50000.00");

    @Column(name = "outstanding_balance", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal outstandingBalance = BigDecimal.ZERO;

    @Column(name = "bypass_credit_limit_check")
    @Builder.Default
    private Boolean bypassCreditLimitCheck = false;

    @Column(name = "is_frozen")
    @Builder.Default
    private Boolean isFrozen = false;

    @Column(name = "default_sales_partner", length = 150)
    private String defaultSalesPartner;

    @Column(name = "default_commission_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal defaultCommissionRate = BigDecimal.ZERO;

    @Column(name = "default_receivable_account", length = 150)
    @Builder.Default
    private String defaultReceivableAccount = "1310 - Debtors / Accounts Receivable";

    @Column(name = "tax_category", length = 100)
    private String taxCategory;

    @Column(name = "so_required")
    @Builder.Default
    private Boolean soRequired = false;

    @Column(name = "dn_required")
    @Builder.Default
    private Boolean dnRequired = false;

    @Column(name = "disabled")
    @Builder.Default
    private Boolean disabled = false;

    @Column(length = 255)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(length = 255)
    private String website;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CustomerAddress> addresses = new ArrayList<>();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CustomerContact> contacts = new ArrayList<>();

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

    public BigDecimal getAvailableCredit() {
        if (Boolean.TRUE.equals(bypassCreditLimitCheck) || creditLimit == null) {
            return BigDecimal.valueOf(Double.MAX_VALUE);
        }
        BigDecimal balance = outstandingBalance != null ? outstandingBalance : BigDecimal.ZERO;
        return creditLimit.subtract(balance);
    }
}
