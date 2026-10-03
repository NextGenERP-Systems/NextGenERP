package com.nextgen.erp.crm.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "crm_contacts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmContact {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @Column(name = "first_name", nullable = false) private String firstName;
    @Column(name = "last_name") private String lastName;
    private String email;
    private String phone;
    @Column(name = "job_title") private String jobTitle;
    @Column(name = "is_primary", nullable = false) private boolean primary;
    @Column(name = "lead_id") private UUID leadId;
    @Column(name = "prospect_id") private UUID prospectId;
    @Column(name = "opportunity_id") private UUID opportunityId;
    @Column(name = "customer_id") private UUID customerId;
    @Column(name = "created_at", nullable = false, updatable = false) private OffsetDateTime createdAt;
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;
    @PrePersist void onCreate() { var now = OffsetDateTime.now(); createdAt = now; updatedAt = now; }
    @PreUpdate void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
