package com.nextgen.erp.crm.presentation.controller;

import com.nextgen.erp.crm.dto.phase5.Phase5Requests.*;
import com.nextgen.erp.crm.service.CrmCommunicationService;
import com.nextgen.erp.crm.service.CrmProviderEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/v1/crm") @RequiredArgsConstructor
public class CrmCommunicationController {
    private final CrmCommunicationService service;
    private final CrmProviderEventService providerEvents;

    @GetMapping("/message-templates") public List<Map<String,Object>> templates(){return service.templates();}
    @GetMapping("/message-templates/{id}") public Map<String,Object> template(@PathVariable UUID id){return service.template(id);}
    @PostMapping("/message-templates") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> create(@Valid @RequestBody Template request){return service.createTemplate(request);}
    @PutMapping("/message-templates/{id}") public Map<String,Object> revise(@PathVariable UUID id,@Valid @RequestBody Template request){return service.reviseTemplate(id,request);}
    @PostMapping("/message-templates/{id}/active") public Map<String,Object> active(@PathVariable UUID id,@RequestBody ActiveRequest request){return service.active(id,request.active());}
    @GetMapping("/contacts/{id}/communication-preferences") public List<Map<String,Object>> preferences(@PathVariable UUID id){return service.preferences(id);}
    @PutMapping("/contacts/{id}/communication-preferences/{channel}") public Map<String,Object> preference(@PathVariable UUID id,@PathVariable Channel channel,@Valid @RequestBody Preference request){return service.preference(id,channel,request);}
    @GetMapping("/contacts/{id}/communication-preferences/{channel}/events") public List<Map<String,Object>> preferenceEvents(@PathVariable UUID id,@PathVariable Channel channel){return service.preferenceEvents(id,channel);}
    @GetMapping("/messages") public List<Map<String,Object>> messages(@RequestParam(required=false) UUID contactId,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="50") int size){return service.messages(contactId,page,size);}
    @GetMapping("/messages/{id}") public Map<String,Object> message(@PathVariable UUID id){return service.message(id);}
    @GetMapping("/messages/{id}/attempts") public List<Map<String,Object>> attempts(@PathVariable UUID id){return service.attempts(id);}
    @PostMapping("/messages") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> enqueue(@Valid @RequestBody Enqueue request){return service.enqueue(request);}
    @PostMapping("/messages/{id}/cancel") public Map<String,Object> cancel(@PathVariable UUID id){return service.cancel(id);}
    @PostMapping("/provider-events/{provider}") public Map<String,Object> providerEvent(@PathVariable String provider,@RequestHeader("X-CRM-Signature") String signature,@Valid @RequestBody CrmProviderEventService.Event request){return providerEvents.accept(provider,signature,request);}
    public record ActiveRequest(boolean active){}
}
