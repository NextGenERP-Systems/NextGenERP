package com.nextgen.erp.crm.service;

import com.nextgen.erp.crm.domain.enums.CrmOpportunityStatus;
import com.nextgen.erp.crm.domain.enums.CrmProspectStatus;
import com.nextgen.erp.crm.domain.model.CrmOpportunity;
import com.nextgen.erp.crm.domain.model.CrmProspect;
import com.nextgen.erp.crm.dto.CrmOpportunityRequest;
import com.nextgen.erp.crm.repository.CrmOpportunityRepository;
import com.nextgen.erp.crm.repository.CrmProspectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CrmOpportunityService {

    private final CrmOpportunityRepository opportunityRepository;
    private final CrmProspectRepository prospectRepository;

    public CrmOpportunityService(CrmOpportunityRepository opportunityRepository, CrmProspectRepository prospectRepository) {
        this.opportunityRepository = opportunityRepository;
        this.prospectRepository = prospectRepository;
    }

    public List<CrmOpportunity> getAllOpportunities() {
        return opportunityRepository.findAll();
    }

    public CrmOpportunity getOpportunityById(UUID id) {
        return opportunityRepository.findById(id).orElseThrow(() -> new RuntimeException("Opportunity not found"));
    }

    @Transactional
    public CrmOpportunity createOpportunity(CrmOpportunityRequest request) {
        CrmProspect prospect = null;
        if (request.getProspectId() != null) {
            prospect = prospectRepository.findById(request.getProspectId())
                    .orElseThrow(() -> new RuntimeException("Prospect not found"));
        }

        if (prospect == null && request.getCustomerId() == null) {
            throw new RuntimeException("Opportunity must belong to a Prospect or an existing Customer");
        }

        CrmOpportunity opp = CrmOpportunity.builder()
                .opportunityName(request.getOpportunityName())
                .prospect(prospect)
                .customerId(request.getCustomerId())
                .amount(request.getAmount())
                .expectedCloseDate(request.getExpectedCloseDate())
                .probability(request.getProbability())
                .status(request.getStatus() != null ? request.getStatus() : CrmOpportunityStatus.OPEN)
                .assignedTo(request.getAssignedTo())
                .build();

        return opportunityRepository.save(opp);
    }

    @Transactional
    public CrmOpportunity updateOpportunity(UUID id, CrmOpportunityRequest request) {
        CrmOpportunity opp = getOpportunityById(id);
        opp.setOpportunityName(request.getOpportunityName());
        opp.setAmount(request.getAmount());
        opp.setExpectedCloseDate(request.getExpectedCloseDate());
        opp.setProbability(request.getProbability());
        if (request.getStatus() != null) {
            opp.setStatus(request.getStatus());
        }
        opp.setAssignedTo(request.getAssignedTo());

        // Update Prospect intent if Won
        if (opp.getStatus() == CrmOpportunityStatus.WON && opp.getProspect() != null) {
            CrmProspect prospect = opp.getProspect();
            prospect.setStatus(CrmProspectStatus.CONVERTED_TO_CUSTOMER);
            prospectRepository.save(prospect);
        }

        return opportunityRepository.save(opp);
    }

    @Transactional
    public void deleteOpportunity(UUID id) {
        opportunityRepository.deleteById(id);
    }
}
