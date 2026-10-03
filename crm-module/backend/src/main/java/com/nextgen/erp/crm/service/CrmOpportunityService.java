package com.nextgen.erp.crm.service;

import com.nextgen.erp.crm.domain.enums.CrmOpportunityStatus;
import com.nextgen.erp.crm.domain.enums.CrmProspectStatus;
import com.nextgen.erp.crm.domain.model.CrmOpportunity;
import com.nextgen.erp.crm.domain.model.CrmProspect;
import com.nextgen.erp.crm.dto.CrmOpportunityRequest;
import com.nextgen.erp.crm.repository.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CrmOpportunityService {

    private final CrmOpportunityRepository opportunityRepository;
    private final CrmProspectRepository prospectRepository;

    private final CrmSalesStageRepository stageRepository;
    private final CrmOpportunityTypeRepository typeRepository;
    private final CrmLostReasonRepository reasonRepository;
    private final CrmHistoryService historyService;
    private final CrmPhase5Service phase5Service;

    public CrmOpportunityService(CrmOpportunityRepository opportunityRepository, CrmProspectRepository prospectRepository, CrmSalesStageRepository stageRepository, CrmOpportunityTypeRepository typeRepository, CrmLostReasonRepository reasonRepository, CrmHistoryService historyService, CrmPhase5Service phase5Service) {
        this.stageRepository = stageRepository;
        this.typeRepository = typeRepository;
        this.reasonRepository = reasonRepository;
        this.historyService = historyService;
        this.phase5Service = phase5Service;
        this.opportunityRepository = opportunityRepository;
        this.prospectRepository = prospectRepository;
    }

    public List<CrmOpportunity> getAllOpportunities() {
        return opportunityRepository.findAll();
    }

    public CrmOpportunity getOpportunityById(UUID id) {
        return opportunityRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunity not found"));
    }

    @Transactional
    public CrmOpportunity createOpportunity(CrmOpportunityRequest request) {
        CrmProspect prospect = null;
        if (request.getProspectId() != null) {
            prospect = prospectRepository.findById(request.getProspectId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prospect not found"));
        }

        if (prospect == null && request.getCustomerId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Opportunity must belong to a Prospect or an existing Customer");
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

        mapMasterData(opp, request);
        applyConversionIntent(opp);
        CrmOpportunity saved = opportunityRepository.save(opp);
        historyService.recordOpportunity(saved, null, "CREATED");
        if(request.getAttributionTouchpointId()!=null){opportunityRepository.flush();phase5Service.recordOpportunityAttribution(request.getAttributionTouchpointId(),saved.getId());}
        return saved;
    }

    @Transactional
    public CrmOpportunity updateOpportunity(UUID id, CrmOpportunityRequest request) {
        CrmOpportunity opp = opportunityRepository.findForUpdate(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunity not found"));
        if (request.getExpectedUpdatedAt() != null && !request.getExpectedUpdatedAt().equals(opp.getUpdatedAt())) {
            throw new CrmConflictException("Opportunity changed since it was loaded. Reload and review your changes.");
        }
        CrmOpportunity previous = CrmOpportunity.builder().id(opp.getId()).opportunityName(opp.getOpportunityName()).prospect(opp.getProspect()).customerId(opp.getCustomerId()).amount(opp.getAmount()).expectedCloseDate(opp.getExpectedCloseDate()).salesStage(opp.getSalesStage()).opportunityType(opp.getOpportunityType()).probability(opp.getProbability()).status(opp.getStatus()).lostReason(opp.getLostReason()).assignedTo(opp.getAssignedTo()).build();
        if (request.getProspectId() == null && request.getCustomerId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Opportunity must belong to a Prospect or an existing Customer");
        }
        opp.setProspect(request.getProspectId() == null ? null : prospectRepository.findById(request.getProspectId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prospect not found")));
        opp.setCustomerId(request.getCustomerId());
        opp.setOpportunityName(request.getOpportunityName());
        opp.setAmount(request.getAmount());
        opp.setExpectedCloseDate(request.getExpectedCloseDate());
        opp.setProbability(request.getProbability());
        if (request.getStatus() != null) {
            opp.setStatus(request.getStatus());
        }
        opp.setAssignedTo(request.getAssignedTo());

        mapMasterData(opp, request);
        applyConversionIntent(opp);
        CrmOpportunity saved = opportunityRepository.save(opp);
        if(historyService.opportunityChanged(previous,saved)) historyService.recordOpportunity(saved,previous,"UPDATED");
        if(request.getAttributionTouchpointId()!=null){opportunityRepository.flush();phase5Service.recordOpportunityAttribution(request.getAttributionTouchpointId(),saved.getId());}
        opportunityRepository.flush();
        return saved;
    }

    @Transactional
    public void deleteOpportunity(UUID id) {
        opportunityRepository.delete(getOpportunityById(id));
    }
    private void applyConversionIntent(CrmOpportunity opp) {
        if (opp.getStatus() == CrmOpportunityStatus.WON && opp.getProspect() != null) {
            opp.getProspect().setStatus(CrmProspectStatus.CONVERTED_TO_CUSTOMER);
            prospectRepository.save(opp.getProspect());
        }
    }
    private void mapMasterData(CrmOpportunity opp, CrmOpportunityRequest request) {
        opp.setSalesStage(request.getSalesStageId() == null ? null : stageRepository.findById(request.getSalesStageId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sales stage not found")));
        opp.setOpportunityType(request.getOpportunityTypeId() == null ? null : typeRepository.findById(request.getOpportunityTypeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Opportunity type not found")));
        opp.setLostReason(request.getLostReasonId() == null ? null : reasonRepository.findById(request.getLostReasonId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lost reason not found")));
    }
}
