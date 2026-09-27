package com.nextgen.erp.sales.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "payment_terms_template_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTermsTemplateItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    @JsonIgnore
    private PaymentTermsTemplate template;

    @Column(name = "payment_term_name", nullable = false, length = 150)
    private String paymentTermName;

    @Column(name = "invoice_portion", nullable = false, precision = 5, scale = 2)
    private BigDecimal invoicePortion; // e.g. 30.00 (%)

    @Column(name = "credit_days", nullable = false)
    @Builder.Default
    private Integer creditDays = 0;

    @Column(name = "credit_months", nullable = false)
    @Builder.Default
    private Integer creditMonths = 0;
}
