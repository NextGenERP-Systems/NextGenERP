package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.*;
import com.nextgen.erp.sales.domain.model.*;
import com.nextgen.erp.sales.infrastructure.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeadOpportunityService {

    private final LeadRepository leadRepository;
    private final OpportunityRepository opportunityRepository;
    private final CustomerRepository customerRepository;
    private final ItemRepository itemRepository;
    private final QuotationService quotationService;

    // --- LEADS ---

    @Transactional(readOnly = true)
    public List<LeadDto> getAllLeads() {
        return leadRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toLeadDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LeadDto getLeadById(UUID id) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found with id: " + id));
        return toLeadDto(lead);
    }

    @Transactional
    public LeadDto createLead(LeadCreateRequest request) {
        Lead lead = Lead.builder()
                .leadName(request.getLeadName())
                .companyName(request.getCompanyName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .status(request.getStatus() != null ? request.getStatus() : LeadStatus.OPEN)
                .leadSource(request.getLeadSource() != null ? request.getLeadSource() : "Website / Inbound")
                .territoryId(request.getTerritoryId())
                .notes(request.getNotes())
                .build();

        Lead saved = leadRepository.save(lead);
        log.info("Created new lead: {} ({})", saved.getLeadName(), saved.getId());
        return toLeadDto(saved);
    }

    @Transactional
    public LeadDto updateLeadStatus(UUID id, LeadStatus status) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found with id: " + id));
        lead.setStatus(status);
        lead.setUpdatedAt(OffsetDateTime.now());
        return toLeadDto(leadRepository.save(lead));
    }

    // --- OPPORTUNITIES ---

    @Transactional(readOnly = true)
    public List<OpportunityDto> getAllOpportunities() {
        return opportunityRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toOpportunityDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OpportunityDto getOpportunityById(UUID id) {
        Opportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Opportunity not found with id: " + id));
        return toOpportunityDto(opp);
    }

    @Transactional
    public OpportunityDto createOpportunity(OpportunityCreateRequest request) {
        Opportunity opp = Opportunity.builder()
                .title(request.getTitle())
                .opportunityFrom(request.getOpportunityFrom() != null ? request.getOpportunityFrom() : "LEAD")
                .partyId(request.getPartyId())
                .partyName(request.getPartyName())
                .opportunityType(request.getOpportunityType() != null ? request.getOpportunityType() : "Sales / ERP")
                .status(request.getStatus() != null ? request.getStatus() : OpportunityStatus.QUALIFICATION)
                .dealSize(request.getDealSize() != null ? request.getDealSize() : java.math.BigDecimal.ZERO)
                .probability(request.getProbability() != null ? request.getProbability() : new java.math.BigDecimal("50.00"))
                .expectedClosingDate(request.getExpectedClosingDate())
                .salesStage(request.getSalesStage() != null ? request.getSalesStage() : "Discovery")
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .notes(request.getNotes())
                .build();

        Opportunity saved = opportunityRepository.save(opp);
        log.info("Created new opportunity: {} ({})", saved.getTitle(), saved.getId());
        return toOpportunityDto(saved);
    }

    @Transactional
    public OpportunityDto updateOpportunityStatus(UUID id, OpportunityStatus status, String stage) {
        Opportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Opportunity not found with id: " + id));
        opp.setStatus(status);
        if (stage != null && !stage.isBlank()) {
            opp.setSalesStage(stage);
        }
        opp.setUpdatedAt(OffsetDateTime.now());
        return toOpportunityDto(opportunityRepository.save(opp));
    }

    @Transactional
    public OpportunityDto convertLeadToOpportunity(UUID leadId) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found with id: " + leadId));
        
        lead.setStatus(LeadStatus.QUALIFIED);
        lead.setUpdatedAt(OffsetDateTime.now());
        leadRepository.save(lead);

        Opportunity opp = Opportunity.builder()
                .title("Deal: " + (lead.getCompanyName() != null ? lead.getCompanyName() : lead.getLeadName()))
                .opportunityFrom("LEAD")
                .partyId(lead.getId())
                .partyName(lead.getCompanyName() != null ? lead.getCompanyName() : lead.getLeadName())
                .opportunityType("Sales / ERP")
                .status(OpportunityStatus.QUALIFICATION)
                .salesStage("Qualification")
                .contactEmail(lead.getEmail())
                .contactPhone(lead.getPhone())
                .dealSize(java.math.BigDecimal.ZERO)
                .probability(new java.math.BigDecimal("60.00"))
                .notes("Converted from Inbound Lead: " + lead.getLeadName())
                .build();

        Opportunity saved = opportunityRepository.save(opp);
        log.info("Converted Lead {} to Opportunity {}", lead.getId(), saved.getId());
        return toOpportunityDto(saved);
    }

    @Transactional
    public QuotationDto convertOpportunityToQuotation(UUID opportunityId, UUID customerId) {
        Opportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new IllegalArgumentException("Opportunity not found with id: " + opportunityId));

        // Advance Opportunity status & stage
        opp.setStatus(OpportunityStatus.PROPOSAL);
        opp.setSalesStage("Proposal Sent");
        opp.setUpdatedAt(OffsetDateTime.now());
        opportunityRepository.save(opp);

        // Find customer or fallback to first available customer
        Customer customer = null;
        if (customerId != null) {
            customer = customerRepository.findById(customerId).orElse(null);
        }
        if (customer == null && opp.getPartyId() != null) {
            customer = customerRepository.findById(opp.getPartyId()).orElse(null);
        }
        if (customer == null) {
            customer = customerRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("No customers available in database"));
        }

        // Get default item
        Item defaultItem = itemRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No items available"));

        QuotationCreateRequest.ItemRequest itemReq = QuotationCreateRequest.ItemRequest.builder()
                .itemId(defaultItem.getId())
                .qty(java.math.BigDecimal.ONE)
                .priceListRate(opp.getDealSize() != null && opp.getDealSize().compareTo(java.math.BigDecimal.ZERO) > 0 ? opp.getDealSize() : defaultItem.getStandardRate())
                .build();

        QuotationCreateRequest qReq = QuotationCreateRequest.builder()
                .customerId(customer.getId())
                .opportunityId(opp.getId())
                .orderType(OrderType.SALES)
                .notes("Generated from Opportunity: " + opp.getTitle())
                .items(List.of(itemReq))
                .build();

        QuotationDto qtn = quotationService.createQuotation(qReq);
        log.info("Converted Opportunity {} to Quotation {}", opp.getId(), qtn.getQuotationNumber());
        return qtn;
    }

    public LeadDto toLeadDto(Lead lead) {
        return LeadDto.builder()
                .id(lead.getId())
                .leadName(lead.getLeadName())
                .companyName(lead.getCompanyName())
                .email(lead.getEmail())
                .phone(lead.getPhone())
                .status(lead.getStatus())
                .leadSource(lead.getLeadSource())
                .territoryId(lead.getTerritoryId())
                .notes(lead.getNotes())
                .createdAt(lead.getCreatedAt())
                .updatedAt(lead.getUpdatedAt())
                .build();
    }

    public OpportunityDto toOpportunityDto(Opportunity opp) {
        return OpportunityDto.builder()
                .id(opp.getId())
                .title(opp.getTitle())
                .opportunityFrom(opp.getOpportunityFrom())
                .partyId(opp.getPartyId())
                .partyName(opp.getPartyName())
                .opportunityType(opp.getOpportunityType())
                .status(opp.getStatus())
                .dealSize(opp.getDealSize())
                .probability(opp.getProbability())
                .expectedClosingDate(opp.getExpectedClosingDate())
                .salesStage(opp.getSalesStage())
                .contactEmail(opp.getContactEmail())
                .contactPhone(opp.getContactPhone())
                .notes(opp.getNotes())
                .createdAt(opp.getCreatedAt())
                .updatedAt(opp.getUpdatedAt())
                .build();
    }
}
