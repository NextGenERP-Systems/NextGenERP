package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sales_partner_payouts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesPartnerPayout {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "payout_number", nullable = false, unique = true, length = 50)
    private String payoutNumber;

    @Column(name = "sales_partner_id", nullable = false)
    private UUID salesPartnerId;

    @Column(name = "sales_partner_name", nullable = false, length = 150)
    private String salesPartnerName;

    @Column(name = "posting_date", nullable = false)
    @Builder.Default
    private LocalDate postingDate = LocalDate.now();

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "reference_note", length = 255)
    private String referenceNote;

    @Column(name = "payment_mode", length = 50)
    @Builder.Default
    private String paymentMode = "Bank Transfer";

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
