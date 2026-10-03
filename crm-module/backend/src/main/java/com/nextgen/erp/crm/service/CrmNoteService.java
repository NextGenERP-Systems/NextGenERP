package com.nextgen.erp.crm.service;
import com.nextgen.erp.crm.domain.model.*; import com.nextgen.erp.crm.dto.*; import com.nextgen.erp.crm.repository.CrmNoteRepository; import lombok.RequiredArgsConstructor; import org.springframework.data.domain.*; import org.springframework.http.HttpStatus; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import org.springframework.web.server.ResponseStatusException; import java.util.UUID;
@Service @RequiredArgsConstructor
public class CrmNoteService {
 private final CrmNoteRepository repo; private final CrmInteractionTargetService targets; private final CrmActor actor;
 @Transactional(readOnly=true) public Page<CrmNote> list(CrmInteractionTargetRequest t,Pageable p){if(t==null)return repo.findAll(p);var x=targets.resolve(t);if(x.getLeadId()!=null)return repo.findByTargetLeadId(x.getLeadId(),p);if(x.getProspectId()!=null)return repo.findByTargetProspectId(x.getProspectId(),p);return repo.findByTargetOpportunityId(x.getOpportunityId(),p);}
 @Transactional(readOnly=true) public CrmNote get(UUID id){return repo.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Note not found"));}
 @Transactional public CrmNote create(CrmNoteRequest r){return repo.save(CrmNote.builder().target(targets.resolve(r.getTarget())).content(r.getContent().trim()).authorId(actor.currentUserId()).build());}
 @Transactional public CrmNote update(UUID id,CrmNoteRequest r){var x=get(id);x.setTarget(targets.resolve(r.getTarget()));x.setContent(r.getContent().trim());return repo.save(x);}
 @Transactional public void delete(UUID id){repo.delete(get(id));}
}
