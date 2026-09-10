package com.nextgen.erp.crm.domain.model;

import com.nextgen.erp.crm.domain.enums.CrmProspectStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "crm_prospects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmProspect {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    private String industry;
    private String website;

    @Column(name = "primary_contact_name")
    private String primaryContactName;

    @Column(name = "primary_contact_email")
    private String primaryContactEmail;

    @Column(name = "primary_contact_phone")
    private String primaryContactPhone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CrmProspectStatus status;

    @Column(name = "customer_id")
    private UUID customerId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = CrmProspectStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
