package com.nextgen.erp.crm.domain.model;

import com.nextgen.erp.crm.domain.enums.CrmLeadStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "crm_leads")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmLead {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    private String email;
    private String phone;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "job_title")
    private String jobTitle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_source_id")
    private CrmLeadSource leadSource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_segment_id")
    private CrmMarketSegment marketSegment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CrmLeadStatus status;

    @Column(name = "assigned_to")
    private UUID assignedTo;

    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = CrmLeadStatus.NEW;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
