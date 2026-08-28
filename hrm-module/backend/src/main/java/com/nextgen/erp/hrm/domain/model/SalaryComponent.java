package com.nextgen.erp.hrm.domain.model;

import com.nextgen.erp.hrm.domain.model.Enums.ComponentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "salary_components")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryComponent {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "component_code", unique = true, nullable = false, length = 50)
    private String componentCode;

    @Column(name = "component_name", nullable = false, length = 150)
    private String componentName;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ComponentType type;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_tax_applicable")
    @Builder.Default
    private Boolean isTaxApplicable = true;

    @Column(name = "is_depends_on_payment_days")
    @Builder.Default
    private Boolean isDependsOnPaymentDays = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
