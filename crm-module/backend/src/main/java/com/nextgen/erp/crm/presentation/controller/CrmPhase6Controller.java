package com.nextgen.erp.crm.presentation.controller;

import com.nextgen.erp.crm.dto.phase6.Phase6Requests.*;
import com.nextgen.erp.crm.service.CrmPhase6Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/v1/crm") @RequiredArgsConstructor
public class CrmPhase6Controller {
    private final CrmPhase6Service service;

    @GetMapping("/contracts") public List<Map<String,Object>> contracts(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="50") int size,@RequestParam(required=false) String status,@RequestParam(required=false) UUID customerId){return service.contracts(page,size,status,customerId);}
    @GetMapping("/contracts/{id}") public Map<String,Object> contract(@PathVariable UUID id){return service.contract(id);}
    @PostMapping("/contracts") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> createContract(@Valid @RequestBody Contract request){return service.createContract(request);}
    @PutMapping("/contracts/{id}") public Map<String,Object> updateContract(@PathVariable UUID id,@Valid @RequestBody Contract request){return service.updateContract(id,request);}
    @PostMapping("/contracts/{id}/items") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> addItem(@PathVariable UUID id,@Valid @RequestBody ContractItem request){return service.addContractItem(id,request);}
    @GetMapping("/contracts/{id}/items") public List<Map<String,Object>> items(@PathVariable UUID id){return service.contractItems(id);}
    @PostMapping("/contracts/{id}/status") public Map<String,Object> contractStatus(@PathVariable UUID id,@Valid @RequestBody ContractStatus request){return service.changeContractStatus(id,request);}
    @GetMapping("/contracts/{id}/events") public List<Map<String,Object>> contractEvents(@PathVariable UUID id){return service.contractEvents(id);}

    @GetMapping("/fulfilments") public List<Map<String,Object>> fulfilments(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="50") int size,@RequestParam(required=false) UUID contractId,@RequestParam(required=false) String status){return service.fulfilments(page,size,contractId,status);}
    @PostMapping("/fulfilments") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> createFulfilment(@Valid @RequestBody Fulfilment request){return service.createFulfilment(request);}
    @GetMapping("/fulfilments/{id}") public Map<String,Object> fulfilment(@PathVariable UUID id){return service.fulfilment(id);}
    @PostMapping("/fulfilments/{id}/status") public Map<String,Object> fulfilmentStatus(@PathVariable UUID id,@Valid @RequestBody FulfilmentStatus request){return service.changeFulfilmentStatus(id,request);}

    @GetMapping("/warranty-claims") public List<Map<String,Object>> claims(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="50") int size,@RequestParam(required=false) String status,@RequestParam(required=false) UUID customerId){return service.claims(page,size,status,customerId);}
    @GetMapping("/warranty-claims/{id}") public Map<String,Object> claim(@PathVariable UUID id){return service.claim(id);}
    @PostMapping("/warranty-claims") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> createClaim(@Valid @RequestBody WarrantyClaim request){return service.createClaim(request);}
    @PostMapping("/warranty-claims/{id}/status") public Map<String,Object> claimStatus(@PathVariable UUID id,@Valid @RequestBody ClaimStatus request){return service.changeClaimStatus(id,request);}
    @GetMapping("/warranty-claims/{id}/events") public List<Map<String,Object>> claimEvents(@PathVariable UUID id){return service.claimEvents(id);}

    @GetMapping("/maintenance-schedules") public List<Map<String,Object>> schedules(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="50") int size,@RequestParam(required=false) UUID customerId,@RequestParam(required=false) String status){return service.schedules(page,size,customerId,status);}
    @PostMapping("/maintenance-schedules") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> createSchedule(@Valid @RequestBody MaintenanceSchedule request){return service.createSchedule(request);}
    @GetMapping("/maintenance-schedules/{id}") public Map<String,Object> schedule(@PathVariable UUID id){return service.schedule(id);}
    @PostMapping("/maintenance-schedules/{id}/status") public Map<String,Object> scheduleStatus(@PathVariable UUID id,@Valid @RequestBody ScheduleStatus request){return service.changeScheduleStatus(id,request);}
    @GetMapping("/maintenance-schedules/{id}/visits") public List<Map<String,Object>> visits(@PathVariable UUID id){return service.visits(id);}
    @PostMapping("/maintenance-schedules/{id}/visits") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> createVisit(@PathVariable UUID id,@Valid @RequestBody MaintenanceVisit request){return service.createVisit(id,request);}
    @PostMapping("/maintenance-visits/{id}/status") public Map<String,Object> visitStatus(@PathVariable UUID id,@Valid @RequestBody VisitStatus request){return service.changeVisitStatus(id,request);}
}
