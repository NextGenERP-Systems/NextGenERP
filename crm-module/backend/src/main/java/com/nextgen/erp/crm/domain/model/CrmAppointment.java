package com.nextgen.erp.crm.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nextgen.erp.crm.domain.enums.CrmAppointmentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity @Table(name="crm_appointments") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmAppointment {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Embedded private CrmInteractionTarget target;
 @Column(nullable=false,length=255) private String subject;
 @Column(columnDefinition="TEXT") private String description;
 @Column(name="starts_at",nullable=false) private OffsetDateTime startsAt;
 @Column(name="ends_at",nullable=false) private OffsetDateTime endsAt;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private CrmAppointmentStatus status;
 @Column(length=255) private String location;
 @Column(name="assigned_to") private UUID assignedTo;
 @Column(name="created_at",nullable=false,updatable=false) private OffsetDateTime createdAt;
 @Column(name="updated_at",nullable=false) private OffsetDateTime updatedAt;
 @Version private long version;
 @PrePersist void onCreate(){validate();var now=OffsetDateTime.now(java.time.ZoneOffset.UTC);createdAt=now;updatedAt=now;}
 @PreUpdate void onUpdate(){validate();updatedAt=OffsetDateTime.now(java.time.ZoneOffset.UTC);}
 private void validate(){if(target==null || (target.getLeadId()!=null?1:0)+(target.getProspectId()!=null?1:0)+(target.getOpportunityId()!=null?1:0)!=1)throw new IllegalStateException("Exactly one CRM target is required");if(startsAt==null||endsAt==null||!endsAt.isAfter(startsAt))throw new IllegalStateException("Appointment end must be after start");}
}
