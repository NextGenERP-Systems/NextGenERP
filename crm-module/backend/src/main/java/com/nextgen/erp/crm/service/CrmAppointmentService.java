package com.nextgen.erp.crm.service;
import com.nextgen.erp.crm.domain.model.*; import com.nextgen.erp.crm.dto.*; import com.nextgen.erp.crm.repository.CrmAppointmentRepository; import lombok.RequiredArgsConstructor; import org.springframework.data.domain.*; import org.springframework.http.HttpStatus; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import org.springframework.web.server.ResponseStatusException; import java.util.UUID;
@Service @RequiredArgsConstructor
public class CrmAppointmentService {
 private final CrmAppointmentRepository repo; private final CrmInteractionTargetService targets;
 @Transactional(readOnly=true) public Page<CrmAppointment> list(CrmInteractionTargetRequest t,Pageable p){if(t==null)return repo.findAll(p);var x=targets.resolve(t);if(x.getLeadId()!=null)return repo.findByTargetLeadId(x.getLeadId(),p);if(x.getProspectId()!=null)return repo.findByTargetProspectId(x.getProspectId(),p);return repo.findByTargetOpportunityId(x.getOpportunityId(),p);}
 @Transactional(readOnly=true) public CrmAppointment get(UUID id){return repo.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Appointment not found"));}
 @Transactional public CrmAppointment create(CrmAppointmentRequest r){validateDates(r);return repo.save(CrmAppointment.builder().target(targets.resolve(r.getTarget())).subject(r.getSubject().trim()).description(r.getDescription()).startsAt(r.getStartsAt()).endsAt(r.getEndsAt()).status(r.getStatus()).location(r.getLocation()).assignedTo(r.getAssignedTo()).build());}
 @Transactional public CrmAppointment update(UUID id,CrmAppointmentRequest r){validateDates(r);var x=get(id);x.setTarget(targets.resolve(r.getTarget()));x.setSubject(r.getSubject().trim());x.setDescription(r.getDescription());x.setStartsAt(r.getStartsAt());x.setEndsAt(r.getEndsAt());x.setStatus(r.getStatus());x.setLocation(r.getLocation());x.setAssignedTo(r.getAssignedTo());return repo.save(x);}
 @Transactional public void delete(UUID id){repo.delete(get(id));}
 private void validateDates(CrmAppointmentRequest r){if(r.getStartsAt()!=null&&r.getEndsAt()!=null&&!r.getEndsAt().isAfter(r.getStartsAt()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Appointment end must be after start");}
}
