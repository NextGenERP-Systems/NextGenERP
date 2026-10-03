package com.nextgen.erp.crm.service;

import com.nextgen.erp.crm.domain.model.*;
import com.nextgen.erp.crm.repository.CrmLeadHistoryRepository;
import com.nextgen.erp.crm.repository.CrmOpportunityHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Objects;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class CrmHistoryService {
 private final CrmLeadHistoryRepository leads;
 private final CrmOpportunityHistoryRepository opportunities;
 private final CrmActor actor;

 public void recordLead(CrmLead current, CrmLead previous, String event) {
  leads.save(CrmLeadHistory.builder().leadId(current.getId()).eventType(event)
   .fromStatus(previous==null?null:value(previous.getStatus())).toStatus(value(current.getStatus()))
   .fromFirstName(previous==null?null:previous.getFirstName()).toFirstName(current.getFirstName())
   .fromLastName(previous==null?null:previous.getLastName()).toLastName(current.getLastName())
   .fromAssignedTo(previous==null?null:previous.getAssignedTo()).toAssignedTo(current.getAssignedTo())
   .fromCompanyName(previous==null?null:previous.getCompanyName()).toCompanyName(current.getCompanyName())
   .fromEmail(previous==null?null:previous.getEmail()).toEmail(current.getEmail())
   .actorId(actor.currentUserId()).build());
 }

 public void recordOpportunity(CrmOpportunity current, CrmOpportunity previous, String event) {
  var currentStage=current.getSalesStage(); var previousStage=previous==null?null:previous.getSalesStage();
  opportunities.save(CrmOpportunityHistory.builder().opportunityId(current.getId()).eventType(event)
   .fromStatus(previous==null?null:value(previous.getStatus())).toStatus(value(current.getStatus()))
   .fromStageId(previousStage==null?null:previousStage.getId()).toStageId(currentStage==null?null:currentStage.getId())
   .fromStageName(previousStage==null?null:previousStage.getName()).toStageName(currentStage==null?null:currentStage.getName())
   .fromAmount(previous==null?null:previous.getAmount()).toAmount(current.getAmount())
   .fromProbability(previous==null?null:previous.getProbability()).toProbability(current.getProbability())
   .fromAssignedTo(previous==null?null:previous.getAssignedTo()).toAssignedTo(current.getAssignedTo())
   .fromProspectId(previous==null||previous.getProspect()==null?null:previous.getProspect().getId())
   .toProspectId(current.getProspect()==null?null:current.getProspect().getId())
   .fromCustomerId(previous==null?null:previous.getCustomerId()).toCustomerId(current.getCustomerId())
   .fromOpportunityName(previous==null?null:previous.getOpportunityName()).toOpportunityName(current.getOpportunityName())
   .fromLostReasonId(previous==null||previous.getLostReason()==null?null:previous.getLostReason().getId())
   .toLostReasonId(current.getLostReason()==null?null:current.getLostReason().getId())
   .fromExpectedCloseDate(previous==null?null:previous.getExpectedCloseDate()).toExpectedCloseDate(current.getExpectedCloseDate())
   .actorId(actor.currentUserId()).build());
 }
 public boolean opportunityChanged(CrmOpportunity a,CrmOpportunity b){return !Objects.equals(a.getStatus(),b.getStatus())||!Objects.equals(a.getOpportunityName(),b.getOpportunityName())||!Objects.equals(id(a.getSalesStage()),id(b.getSalesStage()))||!Objects.equals(a.getAmount(),b.getAmount())||!Objects.equals(a.getProbability(),b.getProbability())||!Objects.equals(a.getAssignedTo(),b.getAssignedTo())||!Objects.equals(a.getCustomerId(),b.getCustomerId())||!Objects.equals(id(a.getProspect()),id(b.getProspect()))||!Objects.equals(id(a.getOpportunityType()),id(b.getOpportunityType()))||!Objects.equals(id(a.getLostReason()),id(b.getLostReason()))||!Objects.equals(a.getExpectedCloseDate(),b.getExpectedCloseDate());}
 private static UUID id(CrmLeadSource x){return x==null?null:x.getId();} private static UUID id(CrmMarketSegment x){return x==null?null:x.getId();}
 private static UUID id(CrmProspect x){return x==null?null:x.getId();} private static UUID id(CrmSalesStage x){return x==null?null:x.getId();}
 private static UUID id(CrmOpportunityType x){return x==null?null:x.getId();} private static UUID id(CrmLostReason x){return x==null?null:x.getId();}
 private static String value(Enum<?> value){return value==null?null:value.name();}
}
