package com.nextgen.erp.crm.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CrmOpportunityCompetitorView(
        UUID id,
        UUID opportunityId,
        UUID competitorId,
        String competitorName,
        String competitorWebsite,
        String strengths,
        String weaknesses,
        String notes,
        OffsetDateTime createdAt) {}
