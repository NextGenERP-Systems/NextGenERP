package com.nextgen.erp.crm.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name="crm_opportunity_competitors") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmOpportunityCompetitor {
    @Id @GeneratedValue(strategy=GenerationType.AUTO) private UUID id;
    @ManyToOne(fetch=FetchType.EAGER, optional=false) @JoinColumn(name="opportunity_id", nullable=false) private CrmOpportunity opportunity;
    @ManyToOne(fetch=FetchType.EAGER, optional=false) @JoinColumn(name="competitor_id", nullable=false) private CrmCompetitor competitor;
    @Column(columnDefinition="TEXT") private String strengths;
    @Column(columnDefinition="TEXT") private String weaknesses;
    @Column(columnDefinition="TEXT") private String notes;
    @Column(name="created_at", nullable=false, updatable=false) private OffsetDateTime createdAt;
    @PrePersist void onCreate(){if(createdAt==null)createdAt=OffsetDateTime.now();}
}
