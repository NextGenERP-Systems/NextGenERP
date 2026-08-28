package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "promotional_schemes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionalScheme {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "apply_on", length = 50)
    @Builder.Default
    private String applyOn = "Item Code";

    @Column(name = "apply_key_id", length = 150)
    private String applyKeyId;

    @Column(name = "valid_from")
    @Builder.Default
    private LocalDate validFrom = LocalDate.now();

    @Column(name = "valid_upto")
    private LocalDate validUpto;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "disabled")
    @Builder.Default
    private Boolean disabled = false;

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
