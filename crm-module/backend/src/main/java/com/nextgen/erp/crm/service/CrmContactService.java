package com.nextgen.erp.crm.service;

import com.nextgen.erp.crm.domain.model.CrmContact;
import com.nextgen.erp.crm.dto.CrmContactRequest;
import com.nextgen.erp.crm.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class CrmContactService {
    private final CrmContactRepository contacts;
    private final CrmLeadRepository leads;
    private final CrmProspectRepository prospects;
    private final CrmOpportunityRepository opportunities;

    @Transactional(readOnly = true)
    public Page<CrmContact> list(UUID leadId, UUID prospectId, UUID opportunityId, UUID customerId, Pageable pageable) {
        long count = java.util.stream.Stream.of(leadId, prospectId, opportunityId, customerId).filter(java.util.Objects::nonNull).count();
        if (count > 1) throw new IllegalArgumentException("Filter by at most one contact owner");
        if (leadId != null) return contacts.findByLeadId(leadId, pageable);
        if (prospectId != null) return contacts.findByProspectId(prospectId, pageable);
        if (opportunityId != null) return contacts.findByOpportunityId(opportunityId, pageable);
        if (customerId != null) return contacts.findByCustomerId(customerId, pageable);
        return contacts.findAll(pageable);
    }
    @Transactional(readOnly = true)
    public CrmContact get(UUID id) { return contacts.findById(id).orElseThrow(() -> new EntityNotFoundException("CRM contact not found")); }
    @Transactional
    public CrmContact create(CrmContactRequest r) { validateOwner(r); return contacts.save(map(new CrmContact(), r)); }
    @Transactional
    public CrmContact update(UUID id, CrmContactRequest r) { validateOwner(r); return contacts.save(map(get(id), r)); }
    @Transactional
    public void delete(UUID id) { contacts.delete(get(id)); }
    private void validateOwner(CrmContactRequest r) {
        if (r.leadId() != null && !leads.existsById(r.leadId())) throw new EntityNotFoundException("CRM lead not found");
        if (r.prospectId() != null && !prospects.existsById(r.prospectId())) throw new EntityNotFoundException("CRM prospect not found");
        if (r.opportunityId() != null && !opportunities.existsById(r.opportunityId())) throw new EntityNotFoundException("CRM opportunity not found");
    }
    private CrmContact map(CrmContact c, CrmContactRequest r) {
        c.setFirstName(r.firstName().trim()); c.setLastName(r.lastName()); c.setEmail(r.email()); c.setPhone(r.phone());
        c.setJobTitle(r.jobTitle()); c.setPrimary(r.primary()); c.setLeadId(r.leadId()); c.setProspectId(r.prospectId());
        c.setOpportunityId(r.opportunityId()); c.setCustomerId(r.customerId()); return c;
    }
}
