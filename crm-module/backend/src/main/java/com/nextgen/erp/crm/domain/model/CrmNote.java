package com.nextgen.erp.crm.domain.model;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; import jakarta.persistence.*; import lombok.*; import java.time.OffsetDateTime; import java.util.UUID;
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name="crm_notes") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmNote {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Embedded private CrmInteractionTarget target;
 @Column(nullable=false,columnDefinition="TEXT") private String content;
 @Column(name="created_at",nullable=false,updatable=false) private OffsetDateTime createdAt;
 @Column(name="updated_at",nullable=false) private OffsetDateTime updatedAt;
 @Column(name="author_id",updatable=false) private UUID authorId;
 @Version private long version;
 @PrePersist void onCreate(){var now=OffsetDateTime.now(java.time.ZoneOffset.UTC);createdAt=now;updatedAt=now;validateTarget();}
 @PreUpdate void onUpdate(){updatedAt=OffsetDateTime.now(java.time.ZoneOffset.UTC);validateTarget();}
 private void validateTarget(){if(target==null || (target.getLeadId()!=null?1:0)+(target.getProspectId()!=null?1:0)+(target.getOpportunityId()!=null?1:0)!=1)throw new IllegalStateException("Exactly one CRM target is required");}
}
