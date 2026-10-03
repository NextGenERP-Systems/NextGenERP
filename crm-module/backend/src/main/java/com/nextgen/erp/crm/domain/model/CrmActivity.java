package com.nextgen.erp.crm.domain.model;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; import com.nextgen.erp.crm.domain.enums.*; import jakarta.persistence.*; import lombok.*; import java.time.OffsetDateTime; import java.util.UUID;
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name="crm_activities") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmActivity {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Enumerated(EnumType.STRING) @Column(name="activity_type",nullable=false) private CrmActivityType activityType;
 @Column(name="occurred_at") private OffsetDateTime occurredAt;
 @Column(name="due_at") private OffsetDateTime dueAt;
@Embedded private CrmInteractionTarget target;
 @Column(nullable=false) private String subject;
 @Column(columnDefinition="TEXT") private String description;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private CrmActivityStatus status;
 @Column(name="assigned_to") private UUID assignedTo;
 @Column(name="created_at",nullable=false,updatable=false) private OffsetDateTime createdAt;
 @Column(name="updated_at",nullable=false) private OffsetDateTime updatedAt;
 @Version private long version;
 @PrePersist void onCreate(){var now=OffsetDateTime.now(java.time.ZoneOffset.UTC);createdAt=now;updatedAt=now;validateTarget();}
 @PreUpdate void onUpdate(){updatedAt=OffsetDateTime.now(java.time.ZoneOffset.UTC);validateTarget();}
 private void validateTarget(){if(target==null || (target.getLeadId()!=null?1:0)+(target.getProspectId()!=null?1:0)+(target.getOpportunityId()!=null?1:0)!=1)throw new IllegalStateException("Exactly one CRM target is required");}

}
