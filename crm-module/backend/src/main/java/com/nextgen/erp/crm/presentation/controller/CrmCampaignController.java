package com.nextgen.erp.crm.presentation.controller;

import com.nextgen.erp.crm.dto.phase5.Phase5Requests.*;
import com.nextgen.erp.crm.service.CrmPhase5Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/v1/crm") @RequiredArgsConstructor
public class CrmCampaignController {
    private final CrmPhase5Service service;

    @GetMapping("/campaigns") public List<Map<String,Object>> campaigns(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="50") int size,@RequestParam(required=false) String status){return service.campaigns(page,size,status);}
    @GetMapping("/campaigns/{id}") public Map<String,Object> campaign(@PathVariable UUID id){return service.campaign(id);}
    @PostMapping("/campaigns") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> create(@Valid @RequestBody Campaign request){return service.createCampaign(request);}
    @PutMapping("/campaigns/{id}") public Map<String,Object> update(@PathVariable UUID id,@Valid @RequestBody VersionedCampaign request){return service.updateCampaign(id,request);}
    @DeleteMapping("/campaigns/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable UUID id){service.deleteCampaign(id);}
    @PostMapping("/campaigns/{id}/status") public Map<String,Object> status(@PathVariable UUID id,@RequestBody StatusRequest request){return service.changeCampaignStatus(id,request.status());}
    @GetMapping("/campaigns/{id}/costs") public List<Map<String,Object>> costs(@PathVariable UUID id){return service.costs(id);}
    @PostMapping("/campaigns/{id}/costs") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> cost(@PathVariable UUID id,@Valid @RequestBody Cost request){return service.addCost(id,request);}
    @GetMapping("/campaigns/{id}/members") public List<Map<String,Object>> members(@PathVariable UUID id,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="50") int size){return service.members(id,page,size);}
    @PostMapping("/campaigns/{id}/members") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> member(@PathVariable UUID id,@Valid @RequestBody Member request){return service.addMember(id,request);}
    @PutMapping("/campaigns/{id}/members/{memberId}") public Map<String,Object> memberStatus(@PathVariable UUID id,@PathVariable UUID memberId,@Valid @RequestBody MemberStatus request){return service.memberStatus(id,memberId,request.status());}
    @GetMapping("/campaigns/{id}/members/{memberId}/events") public List<Map<String,Object>> memberEvents(@PathVariable UUID id,@PathVariable UUID memberId){return service.memberEvents(id,memberId);}
    @PostMapping("/campaigns/{id}/touchpoints") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> touchpoint(@PathVariable UUID id,@Valid @RequestBody Touchpoint request){if(request.campaignId()!=null&&!id.equals(request.campaignId()))throw new IllegalArgumentException("Path and body campaign IDs must match");Touchpoint scoped=new Touchpoint(request.targetType(),request.targetId(),id,request.eventType(),request.eventKey(),request.source(),request.medium(),request.utmSource(),request.utmMedium(),request.utmCampaign(),request.utmContent(),request.utmTerm(),request.occurredAt());return service.addTouchpoint(scoped);}
    @GetMapping("/campaigns/{id}/touchpoints") public List<Map<String,Object>> touchpoints(@PathVariable UUID id){return service.campaignTouchpoints(id);}
    @GetMapping("/leads/{id}/attribution") public List<Map<String,Object>> leadAttribution(@PathVariable UUID id){return service.attribution(TargetType.LEAD,id);}
    @GetMapping("/prospects/{id}/attribution") public List<Map<String,Object>> prospectAttribution(@PathVariable UUID id){return service.attribution(TargetType.PROSPECT,id);}
    @GetMapping("/opportunities/{id}/attribution") public List<Map<String,Object>> opportunityAttribution(@PathVariable UUID id){return service.attribution(TargetType.OPPORTUNITY,id);}
    @PostMapping("/leads/{id}/attribution") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> leadLink(@PathVariable UUID id,@Valid @RequestBody AttributionRequest request){return service.linkAttribution(request.touchpointId(),TargetType.LEAD,id,request.linkType());}
    @PostMapping("/prospects/{id}/attribution") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> prospectLink(@PathVariable UUID id,@Valid @RequestBody AttributionRequest request){return service.linkAttribution(request.touchpointId(),TargetType.PROSPECT,id,request.linkType());}
    @PostMapping("/opportunities/{id}/attribution") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> opportunityLink(@PathVariable UUID id,@Valid @RequestBody AttributionRequest request){return service.linkAttribution(request.touchpointId(),TargetType.OPPORTUNITY,id,request.linkType());}
    public record StatusRequest(@jakarta.validation.constraints.NotBlank String status){}
    public record AttributionRequest(@jakarta.validation.constraints.NotNull UUID touchpointId,@jakarta.validation.constraints.NotBlank String linkType){}
}
