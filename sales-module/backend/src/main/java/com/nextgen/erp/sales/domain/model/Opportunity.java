package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "opportunities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Opportunity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "opportunity_from", nullable = false, length = 50)
    @Builder.Default
    private String opportunityFrom = "LEAD"; // LEAD or CUSTOMER

    @Column(name = "party_id")
    private UUID partyId;

    @Column(name = "party_name", nullable = false, length = 150)
    private String partyName;

    @Column(name = "opportunity_type", length = 100)
    @Builder.Default
    private String opportunityType = "Sales / ERP";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private OpportunityStatus status = OpportunityStatus.QUALIFICATION;

    @Column(name = "deal_size", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal dealSize = BigDecimal.ZERO;

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal probability = new BigDecimal("50.00");

    @Column(name = "expected_closing_date")
    private LocalDate expectedClosingDate;

    @Column(name = "sales_stage", length = 100)
    @Builder.Default
    private String salesStage = "Discovery";

    @Column(name = "contact_email", length = 150)
    private String contactEmail;

    @Column(name = "contact_phone", length = 50)
    private String contactPhone;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();
}
