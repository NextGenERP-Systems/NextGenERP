package com.nextgen.erp.crm.presentation.controller;

import com.nextgen.erp.crm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/crm/lookups")
@RequiredArgsConstructor
public class CrmLookupController {
    private final CrmLeadSourceRepository sources;
    private final CrmMarketSegmentRepository segments;
    private final CrmSalesStageRepository stages;
    private final CrmOpportunityTypeRepository types;
    private final CrmLostReasonRepository reasons;

    @GetMapping
    public Map<String, Object> list() {
        var orderedStages = new ArrayList<>(stages.findAll());
        orderedStages.sort(Comparator.comparing(com.nextgen.erp.crm.domain.model.CrmSalesStage::getSequenceOrder)
                .thenComparing(com.nextgen.erp.crm.domain.model.CrmSalesStage::getName));
        return Map.of("leadSources", sources.findAll(), "marketSegments", segments.findAll(),
                "salesStages", orderedStages, "opportunityTypes", types.findAll(), "lostReasons", reasons.findAll());
    }
}
