package com.nextgen.erp.crm.service;

import com.nextgen.erp.crm.domain.enums.CrmLeadStatus;
import com.nextgen.erp.crm.domain.enums.CrmProspectStatus;
import com.nextgen.erp.crm.domain.model.CrmLead;
import com.nextgen.erp.crm.domain.model.CrmProspect;
import com.nextgen.erp.crm.domain.model.CrmLeadProspectLink;
import com.nextgen.erp.crm.dto.CrmLeadRequest;
import com.nextgen.erp.crm.repository.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CrmLeadService {

    private final CrmLeadRepository leadRepository;
    private final CrmProspectRepository prospectRepository;

    private final CrmLeadSourceRepository sourceRepository;
    private final CrmMarketSegmentRepository segmentRepository;
    private final CrmHistoryService historyService;
    private final CrmLeadProspectLinkRepository conversionLinks;
    private final CrmActor actor;
    private final CrmPhase5Service phase5Service;

    public CrmLeadService(CrmLeadRepository leadRepository, CrmProspectRepository prospectRepository, CrmLeadSourceRepository sourceRepository, CrmMarketSegmentRepository segmentRepository, CrmHistoryService historyService, CrmLeadProspectLinkRepository conversionLinks, CrmActor actor, CrmPhase5Service phase5Service) {
        this.sourceRepository = sourceRepository;
        this.segmentRepository = segmentRepository;
        this.historyService = historyService;
        this.conversionLinks = conversionLinks;
        this.actor = actor;
        this.phase5Service = phase5Service;
        this.leadRepository = leadRepository;
        this.prospectRepository = prospectRepository;
    }

    public List<CrmLead> getAllLeads() {
        return leadRepository.findAll();
    }

    public CrmLead getLeadById(UUID id) {
        return leadRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));
    }

    @Transactional
    public CrmLead createLead(CrmLeadRequest request) {
        if (request.getStatus() == CrmLeadStatus.QUALIFIED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use the qualification endpoint to qualify a lead");
        }
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
        
        mapMasterData(lead, request);
        CrmLead saved = leadRepository.save(lead);
        historyService.recordLead(saved, null, "CREATED");
        return saved;
    }

    @Transactional
    public CrmLead updateLead(UUID id, CrmLeadRequest request) {
        CrmLead lead = leadRepository.findForQualification(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));
        if (request.getStatus() != null && request.getStatus() != lead.getStatus() &&
                (request.getStatus() == CrmLeadStatus.QUALIFIED || lead.getStatus() == CrmLeadStatus.QUALIFIED)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Qualification must use the qualification endpoint and cannot be reversed");
        }
        CrmLead previous = CrmLead.builder().id(lead.getId()).firstName(lead.getFirstName()).lastName(lead.getLastName()).status(lead.getStatus()).companyName(lead.getCompanyName()).email(lead.getEmail()).assignedTo(lead.getAssignedTo()).leadSource(lead.getLeadSource()).marketSegment(lead.getMarketSegment()).build();
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
        mapMasterData(lead, request);
        CrmLead saved = leadRepository.save(lead);
        historyService.recordLead(saved, previous, "UPDATED");
        return saved;
    }

    @Transactional
    public void deleteLead(UUID id) {
        leadRepository.delete(getLeadById(id));
    }

    @Transactional
    public CrmProspect qualifyLeadToProspect(UUID leadId) {
        return qualifyLeadToProspect(leadId, null);
    }

    @Transactional
    public CrmProspect qualifyLeadToProspect(UUID leadId, UUID attributionTouchpointId) {
        CrmLead lead = leadRepository.findForQualification(leadId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));
        
        var existingLink = conversionLinks.findByLeadId(leadId);
        if (existingLink.isPresent()) {
            CrmProspect existing=prospectRepository.findById(existingLink.get().getProspectId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Linked prospect is missing"));
            if(attributionTouchpointId!=null)phase5Service.recordQualificationAttribution(attributionTouchpointId,leadId,existing.getId());
            return existing;
        }
        if (lead.getStatus() == CrmLeadStatus.UNQUALIFIED || lead.getStatus() == CrmLeadStatus.QUALIFIED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lead is already qualified or unqualified");
        }

        CrmLead previous = CrmLead.builder().id(lead.getId()).firstName(lead.getFirstName()).lastName(lead.getLastName()).status(lead.getStatus()).companyName(lead.getCompanyName()).email(lead.getEmail()).assignedTo(lead.getAssignedTo()).build();
        lead.setStatus(CrmLeadStatus.QUALIFIED);
        CrmLead qualified = leadRepository.save(lead);
        historyService.recordLead(qualified, previous, "QUALIFIED");

        String contactName = java.util.stream.Stream.of(lead.getFirstName(), lead.getLastName())
                .filter(value -> value != null && !value.isBlank()).collect(java.util.stream.Collectors.joining(" "));
        if ((lead.getCompanyName() == null || lead.getCompanyName().isBlank()) && contactName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A company or contact name is required to qualify a lead");
        }
        CrmProspect prospect = CrmProspect.builder()
                .companyName(lead.getCompanyName() != null && !lead.getCompanyName().isBlank() ? lead.getCompanyName() : contactName)
                .primaryContactName(contactName)
                .primaryContactEmail(lead.getEmail())
                .primaryContactPhone(lead.getPhone())
                .status(CrmProspectStatus.ACTIVE)
                .build();

        CrmProspect savedProspect = prospectRepository.save(prospect);
        conversionLinks.save(CrmLeadProspectLink.builder().leadId(leadId).prospectId(savedProspect.getId()).linkedBy(actor.currentUserId()).build());
        if(attributionTouchpointId!=null){
            prospectRepository.flush();
            phase5Service.recordQualificationAttribution(attributionTouchpointId,leadId,savedProspect.getId());
        }
        return savedProspect;
    }
    private void mapMasterData(CrmLead lead, CrmLeadRequest request) {
        lead.setLeadSource(request.getLeadSourceId() == null ? null : sourceRepository.findById(request.getLeadSourceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lead source not found")));
        lead.setMarketSegment(request.getMarketSegmentId() == null ? null : segmentRepository.findById(request.getMarketSegmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Market segment not found")));
    }
}
