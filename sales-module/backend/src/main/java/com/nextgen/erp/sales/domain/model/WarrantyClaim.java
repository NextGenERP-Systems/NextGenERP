package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "warranty_claims")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarrantyClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "claim_number", nullable = false, unique = true, length = 50)
    private String claimNumber;

    @Column(name = "customer_id")
    private UUID customerId;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "item_code", nullable = false, length = 100)
    private String itemCode;

    @Column(name = "item_name", nullable = false, length = 255)
    private String itemName;

    @Column(name = "serial_no", length = 100)
    private String serialNo;

    @Column(name = "complaint_description", nullable = false, columnDefinition = "TEXT")
    private String complaintDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private ClaimStatus status = ClaimStatus.OPEN;

    @Column(name = "resolution_type", length = 50)
    @Builder.Default
    private String resolutionType = "REPAIR";

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "reported_date", nullable = false)
    @Builder.Default
    private LocalDate reportedDate = LocalDate.now();

    @Column(name = "resolved_date")
    private LocalDate resolvedDate;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public enum ClaimStatus {
        OPEN,
        IN_INSPECTION,
        RESOLVED,
        REJECTED,
        CLOSED
    }
}
