package com.nextgen.erp.crm.presentation.controller;

import com.nextgen.erp.crm.service.CrmAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/crm/analytics") @RequiredArgsConstructor
public class CrmAnalyticsController {
    private final CrmAnalyticsService service;
    @GetMapping("/overview") public Map<String,Object> overview(@RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,@RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to,@RequestParam(required=false) UUID ownerId){return service.overview(from,to,ownerId);}
    @GetMapping("/funnel") public Map<String,Object> funnel(@RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,@RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to,@RequestParam(required=false) UUID ownerId){return service.funnel(from,to,ownerId);}
    @GetMapping("/pipeline") public Map<String,Object> pipeline(@RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,@RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to,@RequestParam(required=false) UUID ownerId){return service.pipeline(from,to,ownerId);}
    @GetMapping("/campaigns") public Map<String,Object> campaigns(@RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,@RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to){return service.campaigns(from,to);}
    @GetMapping("/service") public Map<String,Object> service(@RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,@RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to,@RequestParam(required=false) UUID customerId){return service.service(from,to,customerId);}
}
