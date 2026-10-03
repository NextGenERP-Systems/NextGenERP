package com.nextgen.erp.crm.domain.model;
import jakarta.persistence.*; import lombok.*; import java.math.BigDecimal; import java.time.OffsetDateTime; import java.util.UUID;
@Entity @Table(name="crm_opportunity_history") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmOpportunityHistory {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(name="opportunity_id",nullable=false,updatable=false) private UUID opportunityId;
 @Column(name="event_type",nullable=false,updatable=false,length=30) private String eventType;
 @Column(name="from_status",updatable=false,length=50) private String fromStatus;
 @Column(name="to_status",updatable=false,length=50) private String toStatus;
 @Column(name="from_stage_id",updatable=false) private UUID fromStageId;
 @Column(name="to_stage_id",updatable=false) private UUID toStageId;
 @Column(name="from_stage_name",updatable=false,length=100) private String fromStageName;
 @Column(name="to_stage_name",updatable=false,length=100) private String toStageName;
 @Column(name="from_amount",updatable=false,precision=15,scale=2) private BigDecimal fromAmount;
 @Column(name="to_amount",updatable=false,precision=15,scale=2) private BigDecimal toAmount;
 @Column(name="from_probability",updatable=false) private Integer fromProbability;
 @Column(name="to_probability",updatable=false) private Integer toProbability;
 @Column(name="from_assigned_to",updatable=false) private UUID fromAssignedTo;
 @Column(name="to_assigned_to",updatable=false) private UUID toAssignedTo;
 @Column(name="from_prospect_id",updatable=false) private UUID fromProspectId;
 @Column(name="to_prospect_id",updatable=false) private UUID toProspectId;
 @Column(name="from_customer_id",updatable=false) private UUID fromCustomerId;
 @Column(name="to_customer_id",updatable=false) private UUID toCustomerId;
 @Column(name="from_opportunity_name",updatable=false,length=255) private String fromOpportunityName;
 @Column(name="to_opportunity_name",updatable=false,length=255) private String toOpportunityName;
 @Column(name="from_lost_reason_id",updatable=false) private UUID fromLostReasonId;
 @Column(name="to_lost_reason_id",updatable=false) private UUID toLostReasonId;
 @Column(name="from_expected_close_date",updatable=false) private java.time.LocalDate fromExpectedCloseDate;
 @Column(name="to_expected_close_date",updatable=false) private java.time.LocalDate toExpectedCloseDate;
 @Column(name="occurred_at",nullable=false,updatable=false) private OffsetDateTime occurredAt;
 @Column(name="actor_id",updatable=false) private UUID actorId;
 @PrePersist void onCreate(){if(occurredAt==null)occurredAt=OffsetDateTime.now(java.time.ZoneOffset.UTC);}
}
