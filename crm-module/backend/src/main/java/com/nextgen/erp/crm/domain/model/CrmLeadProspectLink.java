package com.nextgen.erp.crm.domain.model;
import jakarta.persistence.*; import lombok.*; import java.time.OffsetDateTime; import java.util.UUID;
@Entity @Table(name="crm_lead_prospect_links") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmLeadProspectLink {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(name="lead_id",nullable=false,unique=true) private UUID leadId;
 @Column(name="prospect_id",nullable=false,unique=true) private UUID prospectId;
 @Column(name="linked_at",nullable=false,updatable=false) private OffsetDateTime linkedAt;
 @Column(name="linked_by") private UUID linkedBy;
 @PrePersist void onCreate(){if(linkedAt==null)linkedAt=OffsetDateTime.now(java.time.ZoneOffset.UTC);}
}
