package com.nextgen.erp.crm.presentation.controller;

import com.nextgen.erp.crm.dto.CrmCustomer360Response;
import com.nextgen.erp.crm.service.CrmCustomer360Service;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/crm") @RequiredArgsConstructor
public class CrmCustomer360Controller {
    private final CrmCustomer360Service service;
    @GetMapping("/customers/{customerId}/360") public CrmCustomer360Response customer(@PathVariable UUID customerId){return service.customer(customerId);}
    @GetMapping("/prospects/{prospectId}/360") public CrmCustomer360Response prospect(@PathVariable UUID prospectId){return service.prospect(prospectId);}
}
