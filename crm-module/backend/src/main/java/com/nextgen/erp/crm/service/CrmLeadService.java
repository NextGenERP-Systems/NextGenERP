package com.nextgen.erp.crm.service;

import com.nextgen.erp.crm.domain.enums.CrmLeadStatus;
import com.nextgen.erp.crm.domain.enums.CrmProspectStatus;
import com.nextgen.erp.crm.domain.model.CrmLead;
import com.nextgen.erp.crm.domain.model.CrmProspect;
import com.nextgen.erp.crm.dto.CrmLeadRequest;
import com.nextgen.erp.crm.repository.CrmLeadRepository;
import com.nextgen.erp.crm.repository.CrmProspectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CrmLeadService {

    private final CrmLeadRepository leadRepository;
    private final CrmProspectRepository prospectRepository;

    public CrmLeadService(CrmLeadRepository leadRepository, CrmProspectRepository prospectRepository) {
        this.leadRepository = leadRepository;
        this.prospectRepository = prospectRepository;
    }

    public List<CrmLead> getAllLeads() {
        return leadRepository.findAll();
    }

    public CrmLead getLeadById(UUID id) {
        return leadRepository.findById(id).orElseThrow(() -> new RuntimeException("Lead not found"));
    }

    @Transactional
    public CrmLead createLead(CrmLeadRequest request) {
        CrmLead lead = CrmLead.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .companyName(request.getCompanyName())
                .jobTitle(request.getJobTitle())
                .status(request.getStatus() != null ? request.getStatus() : CrmLeadStatus.NEW)
                .notes(request.getNotes())
                .assignedTo(request.getAssignedTo())
                .build();
        
        // TODO: Map LeadSource and MarketSegment if provided in request
        return leadRepository.save(lead);
    }

    @Transactional
    public CrmLead updateLead(UUID id, CrmLeadRequest request) {
        CrmLead lead = getLeadById(id);
        lead.setFirstName(request.getFirstName());
        lead.setLastName(request.getLastName());
        lead.setEmail(request.getEmail());
        lead.setPhone(request.getPhone());
        lead.setCompanyName(request.getCompanyName());
        lead.setJobTitle(request.getJobTitle());
        if (request.getStatus() != null) {
            lead.setStatus(request.getStatus());
        }
        lead.setNotes(request.getNotes());
        lead.setAssignedTo(request.getAssignedTo());
        return leadRepository.save(lead);
    }

    @Transactional
    public void deleteLead(UUID id) {
        leadRepository.deleteById(id);
    }

    @Transactional
    public CrmProspect qualifyLeadToProspect(UUID leadId) {
        CrmLead lead = getLeadById(leadId);
        
        if (lead.getStatus() == CrmLeadStatus.UNQUALIFIED) {
            throw new RuntimeException("Cannot qualify an unqualified lead.");
        }

        lead.setStatus(CrmLeadStatus.QUALIFIED);
        leadRepository.save(lead);

        CrmProspect prospect = CrmProspect.builder()
                .companyName(lead.getCompanyName() != null ? lead.getCompanyName() : lead.getFirstName() + " " + lead.getLastName())
                .primaryContactName(lead.getFirstName() + " " + lead.getLastName())
                .primaryContactEmail(lead.getEmail())
                .primaryContactPhone(lead.getPhone())
                .status(CrmProspectStatus.ACTIVE)
                .build();

        return prospectRepository.save(prospect);
    }
}
