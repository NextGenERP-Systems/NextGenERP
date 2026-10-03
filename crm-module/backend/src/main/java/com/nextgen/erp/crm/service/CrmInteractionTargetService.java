package com.nextgen.erp.crm.service;
import com.nextgen.erp.crm.domain.enums.CrmInteractionTargetType; import com.nextgen.erp.crm.domain.model.CrmInteractionTarget; import com.nextgen.erp.crm.dto.CrmInteractionTargetRequest;
import com.nextgen.erp.crm.repository.*; import lombok.RequiredArgsConstructor; import org.springframework.http.HttpStatus; import org.springframework.stereotype.Service; import org.springframework.web.server.ResponseStatusException; import java.util.UUID;
@Service @RequiredArgsConstructor
public class CrmInteractionTargetService {
 private final CrmLeadRepository leads; private final CrmProspectRepository prospects; private final CrmOpportunityRepository opportunities;
 public CrmInteractionTarget resolve(CrmInteractionTargetRequest r){
  if(r==null||r.getTargetType()==null||r.getTargetId()==null)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"targetType and targetId are required");
  UUID id=r.getTargetId(); boolean found=switch(r.getTargetType()){case LEAD->leads.existsById(id);case PROSPECT->prospects.existsById(id);case OPPORTUNITY->opportunities.existsById(id);};
  if(!found)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"CRM interaction target not found");
  return switch(r.getTargetType()){case LEAD->new CrmInteractionTarget(id,null,null);case PROSPECT->new CrmInteractionTarget(null,id,null);case OPPORTUNITY->new CrmInteractionTarget(null,null,id);};
 }
 public UUID targetId(CrmInteractionTarget target, CrmInteractionTargetType type){if(target==null)return null;return switch(type){case LEAD->target.getLeadId();case PROSPECT->target.getProspectId();case OPPORTUNITY->target.getOpportunityId();};}
}
