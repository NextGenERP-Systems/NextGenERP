package com.nextgen.erp.crm.service;

import com.nextgen.erp.crm.domain.model.*;
import com.nextgen.erp.crm.dto.*;
import com.nextgen.erp.crm.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class CrmCompetitorService {
    private final CrmCompetitorRepository competitors;
    private final CrmOpportunityCompetitorRepository links;
    private final CrmOpportunityRepository opportunities;
    @Transactional(readOnly=true) public List<CrmCompetitor> list(){return competitors.findAll(org.springframework.data.domain.Sort.by("name").ascending());}
    @Transactional(readOnly=true) public CrmCompetitor get(UUID id){return competitors.findById(id).orElseThrow(()->new EntityNotFoundException("CRM competitor not found"));}
    @Transactional public CrmCompetitor create(CrmCompetitorRequest r){
        String name=r.name().trim();
        if(competitors.existsByNameIgnoreCase(name))throw new IllegalArgumentException("A competitor with this name already exists");
        CrmCompetitor c=new CrmCompetitor();return save(c,r);
    }
    @Transactional public CrmCompetitor update(UUID id,CrmCompetitorRequest r){
        CrmCompetitor c=get(id);String name=r.name().trim();
        if(competitors.existsByNameIgnoreCaseAndIdNot(name,id))throw new IllegalArgumentException("A competitor with this name already exists");
        return save(c,r);
    }
    private CrmCompetitor save(CrmCompetitor c,CrmCompetitorRequest r){c.setName(r.name().trim());c.setWebsite(r.website());c.setDescription(r.description());return competitors.save(c);}
    @Transactional public void delete(UUID id){competitors.delete(get(id));}
    @Transactional(readOnly=true) public List<CrmOpportunityCompetitorView> forOpportunity(UUID id){if(!opportunities.existsById(id))throw new EntityNotFoundException("CRM opportunity not found");return links.findByOpportunityIdOrderByCreatedAtDesc(id).stream().map(this::view).toList();}
    @Transactional public CrmOpportunityCompetitorView add(UUID opportunityId,CrmOpportunityCompetitorRequest r){
        CrmOpportunity opportunity=opportunities.findById(opportunityId).orElseThrow(()->new EntityNotFoundException("CRM opportunity not found"));
        CrmCompetitor competitor=get(r.competitorId());
        CrmOpportunityCompetitor link=CrmOpportunityCompetitor.builder().opportunity(opportunity).competitor(competitor).strengths(r.strengths()).weaknesses(r.weaknesses()).notes(r.notes()).build();
        return view(links.save(link));
    }
    @Transactional public CrmOpportunityCompetitorView update(UUID opportunityId,UUID competitorId,CrmOpportunityCompetitorRequest r){
        if(!competitorId.equals(r.competitorId()))throw new IllegalArgumentException("competitorId in the path and body must match");
        CrmOpportunityCompetitor link=links.findByOpportunityIdAndCompetitorId(opportunityId,competitorId)
                .orElseThrow(()->new EntityNotFoundException("Opportunity competitor link not found"));
        link.setStrengths(r.strengths());link.setWeaknesses(r.weaknesses());link.setNotes(r.notes());
        return view(links.save(link));
    }
    @Transactional public void remove(UUID opportunityId,UUID competitorId){
        CrmOpportunityCompetitor link=links.findByOpportunityIdAndCompetitorId(opportunityId,competitorId).orElseThrow(()->new EntityNotFoundException("Opportunity competitor link not found"));
        links.delete(link);
    }
    private CrmOpportunityCompetitorView view(CrmOpportunityCompetitor l){return new CrmOpportunityCompetitorView(l.getId(),l.getOpportunity().getId(),l.getCompetitor().getId(),l.getCompetitor().getName(),l.getCompetitor().getWebsite(),l.getStrengths(),l.getWeaknesses(),l.getNotes(),l.getCreatedAt());}
}
