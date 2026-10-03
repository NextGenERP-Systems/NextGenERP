package com.nextgen.erp.crm.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.nextgen.erp.crm.domain.model.*;
import java.util.List;
import java.util.UUID;

public record CrmCustomer360Response(
        UUID customerId,
        List<CrmProspect> prospects,
        List<CrmContact> contacts,
        List<CrmOpportunity> opportunities,
        List<CrmActivity> activities,
        List<CrmNote> notes,
        List<CrmAppointment> appointments,
        List<CrmOpportunityHistory> opportunityHistory,
        List<CrmOpportunityCompetitorView> competitors,
        String salesStatus,
        JsonNode salesDashboard) {}
