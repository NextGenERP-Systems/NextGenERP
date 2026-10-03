package com.nextgen.erp.crm.service;

import com.nextgen.erp.crm.domain.model.*;
import com.nextgen.erp.crm.dto.CrmCustomer360Response;
import com.nextgen.erp.crm.dto.CrmOpportunityCompetitorView;
import com.nextgen.erp.crm.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Stream;

@Service @RequiredArgsConstructor
public class CrmCustomer360Service {
    private final CrmContactRepository contacts;
    private final CrmOpportunityRepository opportunities;
    private final CrmProspectRepository prospects;
    private final CrmActivityRepository activities;
    private final CrmNoteRepository notes;
    private final CrmAppointmentRepository appointments;
    private final CrmOpportunityHistoryRepository history;
    private final CrmOpportunityCompetitorRepository competitorLinks;
    private final SalesCustomerDashboardClient sales;

    @Transactional(readOnly=true)
    public CrmCustomer360Response customer(UUID customerId) {
        var customerContacts = contacts.findTop100ByCustomerIdOrderByLastNameAscFirstNameAsc(customerId);
        var customerOpportunities = opportunities.findTop100ByCustomerIdOrderByUpdatedAtDesc(customerId);
        var linkedProspects = prospects.findTop100ByCustomerId(customerId);
        List<UUID> prospectIds = linkedProspects.stream().map(CrmProspect::getId).toList();
        var prospectOpportunities = prospectIds.isEmpty()?List.<CrmOpportunity>of():opportunities.findTop100ByProspectIdInOrderByUpdatedAtDesc(prospectIds);
        var allOpportunities = Stream.concat(customerOpportunities.stream(), prospectOpportunities.stream()).limit(100)
                .collect(java.util.stream.Collectors.toMap(CrmOpportunity::getId, o -> o, (a,b) -> a, LinkedHashMap::new)).values().stream().toList();
        var interactions = collect(allOpportunities, prospectIds);
        var salesResult = sales.fetch(customerId);
        return new CrmCustomer360Response(customerId, linkedProspects,
                combine(customerContacts, interactions.contacts), allOpportunities, interactions.activities, interactions.notes, interactions.appointments,
                interactions.history, interactions.competitors, salesResult.status(), salesResult.dashboard());
    }

    @Transactional(readOnly=true)
    public CrmCustomer360Response prospect(UUID prospectId) {
        CrmProspect prospect = prospects.findById(prospectId).orElseThrow(() -> new EntityNotFoundException("CRM prospect not found"));
        var prospectContacts = contacts.findTop100ByProspectIdOrderByLastNameAscFirstNameAsc(prospectId);
        var prospectOpportunities = opportunities.findTop100ByProspectIdOrderByUpdatedAtDesc(prospectId);
        var interactions = collect(prospectOpportunities, List.of(prospectId));
        var salesResult = prospect.getCustomerId()==null?null:sales.fetch(prospect.getCustomerId());
        return new CrmCustomer360Response(prospect.getCustomerId(), List.of(prospect), combine(prospectContacts, interactions.contacts),
                prospectOpportunities, interactions.activities, interactions.notes, interactions.appointments,
                interactions.history, interactions.competitors, salesResult==null?"NOT_APPLICABLE":salesResult.status(),
                salesResult==null?null:salesResult.dashboard());
    }

    private InteractionData collect(List<CrmOpportunity> opps, List<UUID> prospectIds) {
        var pageable = PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by("id").descending()));
        var historyPageable = PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "occurredAt").and(Sort.by("id").descending()));
        List<UUID> opportunityIds = opps.stream().map(CrmOpportunity::getId).toList();
        List<CrmContact> contactRows = new ArrayList<>();
        if (!prospectIds.isEmpty()) contactRows.addAll(contacts.findTop100ByProspectIdInOrderByLastNameAscFirstNameAsc(prospectIds));
        if (!opportunityIds.isEmpty()) contactRows.addAll(contacts.findTop100ByOpportunityIdInOrderByLastNameAscFirstNameAsc(opportunityIds));
        List<CrmActivity> activityRows = new ArrayList<>(); List<CrmNote> noteRows = new ArrayList<>();
        List<CrmAppointment> appointmentRows = new ArrayList<>(); List<CrmOpportunityHistory> historyRows = new ArrayList<>();
        List<CrmOpportunityCompetitorView> competitorRows = new ArrayList<>();
        if (!prospectIds.isEmpty()) {
            activityRows.addAll(activities.findByTargetProspectIdIn(prospectIds, pageable).getContent());
            noteRows.addAll(notes.findByTargetProspectIdIn(prospectIds, pageable).getContent());
            appointmentRows.addAll(appointments.findByTargetProspectIdIn(prospectIds, pageable).getContent());
        }
        if (!opportunityIds.isEmpty()) {
            activityRows.addAll(activities.findByTargetOpportunityIdIn(opportunityIds, pageable).getContent());
            noteRows.addAll(notes.findByTargetOpportunityIdIn(opportunityIds, pageable).getContent());
            appointmentRows.addAll(appointments.findByTargetOpportunityIdIn(opportunityIds, pageable).getContent());
            historyRows.addAll(history.findByOpportunityIdInOrderByOccurredAtDescIdDesc(opportunityIds, historyPageable).getContent());
            competitorRows.addAll(competitorLinks.findByOpportunityIdInOrderByCreatedAtDesc(opportunityIds).stream().map(l ->
                    new CrmOpportunityCompetitorView(l.getId(), l.getOpportunity().getId(), l.getCompetitor().getId(),
                            l.getCompetitor().getName(), l.getCompetitor().getWebsite(), l.getStrengths(), l.getWeaknesses(), l.getNotes(), l.getCreatedAt())).toList());
        }
        activityRows.sort(Comparator.comparing((CrmActivity a) -> a.getOccurredAt()==null?a.getCreatedAt():a.getOccurredAt())
                .thenComparing(CrmActivity::getId).reversed());
        noteRows.sort(Comparator.comparing(CrmNote::getCreatedAt).reversed());
        appointmentRows.sort(Comparator.comparing(CrmAppointment::getStartsAt).reversed());
        historyRows.sort(Comparator.comparing(CrmOpportunityHistory::getOccurredAt).thenComparing(CrmOpportunityHistory::getId).reversed());
        competitorRows.sort(Comparator.comparing(CrmOpportunityCompetitorView::createdAt).reversed());
        return new InteractionData(limit(contactRows), limit(activityRows), limit(noteRows), limit(appointmentRows), limit(historyRows), limit(competitorRows));
    }
    private static <T> List<T> limit(List<T> rows) { return rows.stream().limit(100).toList(); }
    private static List<CrmContact> combine(List<CrmContact> first, List<CrmContact> second) {
        return Stream.concat(first.stream(), second.stream()).collect(java.util.stream.Collectors.toMap(CrmContact::getId, c -> c, (a,b) -> a, LinkedHashMap::new)).values().stream().limit(100).toList();
    }
    private record InteractionData(List<CrmContact> contacts, List<CrmActivity> activities, List<CrmNote> notes, List<CrmAppointment> appointments,
            List<CrmOpportunityHistory> history, List<CrmOpportunityCompetitorView> competitors) {}
}
