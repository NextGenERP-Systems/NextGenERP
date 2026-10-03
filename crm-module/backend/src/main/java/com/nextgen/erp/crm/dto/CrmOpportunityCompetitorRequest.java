package com.nextgen.erp.crm.dto;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
public record CrmOpportunityCompetitorRequest(@NotNull UUID competitorId, String strengths, String weaknesses, String notes) {}
