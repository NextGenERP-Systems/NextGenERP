package com.nextgen.erp.crm.domain.model;
import jakarta.persistence.*; import lombok.*; import java.time.OffsetDateTime; import java.util.UUID;
@Entity @Table(name="crm_lead_history") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmLeadHistory {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(name="lead_id",nullable=false,updatable=false) private UUID leadId;
 @Column(name="event_type",nullable=false,updatable=false,length=30) private String eventType;
 @Column(name="from_status",updatable=false,length=50) private String fromStatus;
 @Column(name="to_status",updatable=false,length=50) private String toStatus;
 @Column(name="from_first_name",updatable=false,length=100) private String fromFirstName;
 @Column(name="to_first_name",updatable=false,length=100) private String toFirstName;
 @Column(name="from_last_name",updatable=false,length=100) private String fromLastName;
 @Column(name="to_last_name",updatable=false,length=100) private String toLastName;
 @Column(name="from_assigned_to",updatable=false) private UUID fromAssignedTo;
 @Column(name="to_assigned_to",updatable=false) private UUID toAssignedTo;
 @Column(name="from_company_name",updatable=false) private String fromCompanyName;
 @Column(name="to_company_name",updatable=false) private String toCompanyName;
 @Column(name="from_email",updatable=false) private String fromEmail;
 @Column(name="to_email",updatable=false) private String toEmail;
 @Column(name="occurred_at",nullable=false,updatable=false) private OffsetDateTime occurredAt;
 @Column(name="actor_id",updatable=false) private UUID actorId;
 @PrePersist void onCreate(){if(occurredAt==null)occurredAt=OffsetDateTime.now(java.time.ZoneOffset.UTC);}
}
