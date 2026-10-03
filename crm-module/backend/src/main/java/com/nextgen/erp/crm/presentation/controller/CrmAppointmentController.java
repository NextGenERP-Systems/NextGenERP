package com.nextgen.erp.crm.presentation.controller;
import com.nextgen.erp.crm.domain.model.CrmAppointment; import com.nextgen.erp.crm.domain.enums.CrmInteractionTargetType; import com.nextgen.erp.crm.dto.*; import com.nextgen.erp.crm.service.CrmAppointmentService; import jakarta.validation.Valid; import org.springframework.data.domain.*; import org.springframework.http.HttpStatus; import org.springframework.web.bind.annotation.*; import java.util.UUID;
@RestController @RequestMapping("/api/v1/crm/appointments")
public class CrmAppointmentController {
 private final CrmAppointmentService service;
 public CrmAppointmentController(CrmAppointmentService service){this.service=service;}
 @GetMapping public CrmPageResponse<CrmAppointment> list(@RequestParam(required=false) CrmInteractionTargetType targetType,@RequestParam(required=false) UUID targetId,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){
  if(page<0||size<1||size>100)throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST,"page must be nonnegative and size must be between 1 and 100");
  if((targetType==null)!=(targetId==null))throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST,"targetType and targetId must be supplied together");
  CrmInteractionTargetRequest target=null;if(targetType!=null){target=new CrmInteractionTargetRequest();target.setTargetType(targetType);target.setTargetId(targetId);}
  return CrmPageResponse.from(service.list(target,PageRequest.of(page,size,Sort.by(Sort.Direction.DESC,"createdAt").and(Sort.by(Sort.Direction.DESC,"id")))));
 }
 @GetMapping("/{id}") public CrmAppointment get(@PathVariable UUID id){return service.get(id);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public CrmAppointment create(@Valid @RequestBody CrmAppointmentRequest body){return service.create(body);}
 @PutMapping("/{id}") public CrmAppointment update(@PathVariable UUID id,@Valid @RequestBody CrmAppointmentRequest body){return service.update(id,body);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable UUID id){service.delete(id);}
}
