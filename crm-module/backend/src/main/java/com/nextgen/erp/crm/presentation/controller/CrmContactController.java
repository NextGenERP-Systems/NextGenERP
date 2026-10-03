package com.nextgen.erp.crm.presentation.controller;

import com.nextgen.erp.crm.domain.model.CrmContact;
import com.nextgen.erp.crm.dto.CrmContactRequest;
import com.nextgen.erp.crm.service.CrmContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import com.nextgen.erp.crm.dto.CrmPageResponse;

@RestController @RequestMapping("/api/v1/crm/contacts") @RequiredArgsConstructor
public class CrmContactController {
    private final CrmContactService service;
    @GetMapping public CrmPageResponse<CrmContact> list(@RequestParam(required=false) UUID leadId, @RequestParam(required=false) UUID prospectId,
            @RequestParam(required=false) UUID opportunityId, @RequestParam(required=false) UUID customerId,
            @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="50") int size) {
        var pageable = PageRequest.of(Math.max(page, 0), Math.max(1, Math.min(size, 100)), Sort.by("lastName").ascending().and(Sort.by("firstName").ascending()));
        return CrmPageResponse.from(service.list(leadId, prospectId, opportunityId, customerId, pageable));
    }
    @GetMapping("/{id}") public CrmContact get(@PathVariable UUID id) { return service.get(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public CrmContact create(@Valid @RequestBody CrmContactRequest request) { return service.create(request); }
    @PutMapping("/{id}") public CrmContact update(@PathVariable UUID id, @Valid @RequestBody CrmContactRequest request) { return service.update(id, request); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable UUID id) { service.delete(id); }
}
