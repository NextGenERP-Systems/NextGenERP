package com.nextgen.erp.crm.domain.model;
import jakarta.persistence.Column; import jakarta.persistence.Embeddable; import java.util.UUID;
@Embeddable
public class CrmInteractionTarget {
 @Column(name="target_lead_id") private UUID leadId;
 @Column(name="target_prospect_id") private UUID prospectId;
 @Column(name="target_opportunity_id") private UUID opportunityId;
 protected CrmInteractionTarget() {}
 public CrmInteractionTarget(UUID leadId, UUID prospectId, UUID opportunityId) { this.leadId=leadId;this.prospectId=prospectId;this.opportunityId=opportunityId; }
 public UUID getLeadId(){return leadId;} public UUID getProspectId(){return prospectId;} public UUID getOpportunityId(){return opportunityId;}
}
