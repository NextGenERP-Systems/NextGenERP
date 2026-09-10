package com.nextgen.erp.crm.service;

import com.nextgen.erp.crm.domain.enums.CrmProspectStatus;
import com.nextgen.erp.crm.domain.model.CrmProspect;
import com.nextgen.erp.crm.dto.CrmProspectRequest;
import com.nextgen.erp.crm.repository.CrmProspectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CrmProspectService {

    private final CrmProspectRepository prospectRepository;

    public CrmProspectService(CrmProspectRepository prospectRepository) {
        this.prospectRepository = prospectRepository;
    }

    public List<CrmProspect> getAllProspects() {
        return prospectRepository.findAll();
    }

    public CrmProspect getProspectById(UUID id) {
        return prospectRepository.findById(id).orElseThrow(() -> new RuntimeException("Prospect not found"));
    }

    @Transactional
    public CrmProspect createProspect(CrmProspectRequest request) {
        CrmProspect prospect = CrmProspect.builder()
                .companyName(request.getCompanyName())
                .industry(request.getIndustry())
                .website(request.getWebsite())
                .primaryContactName(request.getPrimaryContactName())
                .primaryContactEmail(request.getPrimaryContactEmail())
                .primaryContactPhone(request.getPrimaryContactPhone())
                .status(request.getStatus() != null ? request.getStatus() : CrmProspectStatus.ACTIVE)
                .customerId(request.getCustomerId())
                .build();

        return prospectRepository.save(prospect);
    }

    @Transactional
    public CrmProspect updateProspect(UUID id, CrmProspectRequest request) {
        CrmProspect prospect = getProspectById(id);
        prospect.setCompanyName(request.getCompanyName());
        prospect.setIndustry(request.getIndustry());
        prospect.setWebsite(request.getWebsite());
        prospect.setPrimaryContactName(request.getPrimaryContactName());
        prospect.setPrimaryContactEmail(request.getPrimaryContactEmail());
        prospect.setPrimaryContactPhone(request.getPrimaryContactPhone());
        if (request.getStatus() != null) {
            prospect.setStatus(request.getStatus());
        }
        prospect.setCustomerId(request.getCustomerId());

        return prospectRepository.save(prospect);
    }

    @Transactional
    public void deleteProspect(UUID id) {
        prospectRepository.deleteById(id);
    }
}
