package com.nextgen.erp.crm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextgen.erp.crm.domain.model.*;
import com.nextgen.erp.crm.repository.*;
import com.nextgen.erp.crm.service.CrmMessageWorkerService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import java.util.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Run only against a disposable PostgreSQL database supplied through environment variables.
@SpringBootTest(properties = {
        "spring.datasource.url=${CRM_TEST_DATABASE_URL}",
        "spring.datasource.username=${CRM_TEST_DATABASE_USERNAME}",
        "spring.datasource.password=${CRM_TEST_DATABASE_PASSWORD}",
        "crm.communication.callback-secret=test-callback-secret"
})
@AutoConfigureMockMvc
class CrmLifecycleIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired CrmLeadSourceRepository sources;
    @Autowired CrmMarketSegmentRepository segments;
    @Autowired CrmSalesStageRepository stages;
    @Autowired CrmOpportunityTypeRepository types;
    @Autowired CrmLostReasonRepository reasons;
    @Autowired JdbcTemplate jdbc;
    @Autowired CrmMessageWorkerService messageWorker;

    private String json(Map<String, Object> value) throws Exception { return mapper.writeValueAsString(value); }
    private String hmac(String value) throws Exception {
        var mac=javax.crypto.Mac.getInstance("HmacSHA256");
        mac.init(new javax.crypto.spec.SecretKeySpec("test-callback-secret".getBytes(java.nio.charset.StandardCharsets.UTF_8),"HmacSHA256"));
        return java.util.HexFormat.of().formatHex(mac.doFinal(value.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
    }
    private String create(String path, Map<String, Object> body) throws Exception {
        var response = mvc.perform(post(path).contentType("application/json").content(json(body)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return mapper.readTree(response).get("id").asText();
    }
    @Test void lifecycleAndMasterDataSurviveDetachedSerialization() throws Exception {
        String suffix = UUID.randomUUID().toString();
        var source = sources.save(CrmLeadSource.builder().name("Web-" + suffix).build());
        var segment = segments.save(CrmMarketSegment.builder().name("Retail-" + suffix).build());
        var stage = stages.save(CrmSalesStage.builder().name("Review-" + suffix).sequenceOrder(1).build());
        var type = types.save(CrmOpportunityType.builder().name("New-" + suffix).build());
        var reason = reasons.save(CrmLostReason.builder().name("Price-" + suffix).build());
        Map<String, Object> lead = new HashMap<>(Map.of("firstName", "Ada", "leadSourceId", source.getId(),
                "marketSegmentId", segment.getId(), "notes", "x".repeat(1000)));
        String leadId = create("/api/v1/crm/leads", lead);
        mvc.perform(get("/api/v1/crm/leads/" + leadId)).andExpect(status().isOk())
                .andExpect(jsonPath("$.leadSource.id").value(source.getId().toString()))
                .andExpect(jsonPath("$.marketSegment.id").value(segment.getId().toString()));
        var qualified = mvc.perform(post("/api/v1/crm/leads/" + leadId + "/qualify"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.primaryContactName").value("Ada"))
                .andReturn().getResponse().getContentAsString();
        String prospectId = mapper.readTree(qualified).get("id").asText();
        var retry = mvc.perform(post("/api/v1/crm/leads/" + leadId + "/qualify"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertThat(mapper.readTree(retry).get("id").asText()).isEqualTo(prospectId);
        lead.put("status", "NEW");
        mvc.perform(put("/api/v1/crm/leads/" + leadId).contentType("application/json").content(json(lead)))
                .andExpect(status().isConflict());
        Map<String, Object> opp = new HashMap<>(Map.of("opportunityName", "Deal", "prospectId", prospectId,
                "salesStageId", stage.getId(), "opportunityTypeId", type.getId(), "status", "WON", "probability", 100));
        String oppId = create("/api/v1/crm/opportunities", opp);
        mvc.perform(get("/api/v1/crm/opportunities/" + oppId)).andExpect(status().isOk())
                .andExpect(jsonPath("$.salesStage.id").value(stage.getId().toString()))
                .andExpect(jsonPath("$.opportunityType.id").value(type.getId().toString()));
        mvc.perform(get("/api/v1/crm/prospects/" + prospectId)).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONVERTED_TO_CUSTOMER")).andExpect(jsonPath("$.customerId").isEmpty());
        opp.remove("prospectId"); opp.put("customerId", UUID.randomUUID()); opp.put("status", "LOST"); opp.put("lostReasonId", reason.getId());
        mvc.perform(put("/api/v1/crm/opportunities/" + oppId).contentType("application/json").content(json(opp)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.lostReason.id").value(reason.getId().toString()))
                .andExpect(jsonPath("$.prospect").isEmpty());
        mvc.perform(get("/api/v1/crm/opportunities")).andExpect(status().isOk());
        mvc.perform(get("/api/v1/crm/leads")).andExpect(status().isOk());
        mvc.perform(delete("/api/v1/crm/opportunities/" + oppId)).andExpect(status().isConflict());
        mvc.perform(delete("/api/v1/crm/prospects/" + prospectId)).andExpect(status().isConflict());
        mvc.perform(delete("/api/v1/crm/leads/" + leadId)).andExpect(status().isConflict());
    }
    @Test void validationAndMissingReferencesReturnClientErrors() throws Exception {
        mvc.perform(get("/api/v1/crm/leads/" + UUID.randomUUID())).andExpect(status().isNotFound());
        mvc.perform(delete("/api/v1/crm/prospects/" + UUID.randomUUID())).andExpect(status().isNotFound());
        mvc.perform(post("/api/v1/crm/prospects").contentType("application/json").content("{}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/v1/crm/opportunities").contentType("application/json")
                .content(json(Map.of("opportunityName", "Invalid", "customerId", UUID.randomUUID(), "probability", 101))))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/v1/crm/leads").contentType("application/json")
                .content(json(Map.of("firstName", "Ada", "leadSourceId", UUID.randomUUID()))))
                .andExpect(status().isBadRequest());
        String prospectId = create("/api/v1/crm/prospects", Map.of("companyName", "Delete protection"));
        String oppId = create("/api/v1/crm/opportunities", Map.of("opportunityName", "Open", "prospectId", prospectId));
        mvc.perform(delete("/api/v1/crm/prospects/" + prospectId)).andExpect(status().isConflict());
        mvc.perform(delete("/api/v1/crm/opportunities/" + oppId)).andExpect(status().isConflict());
    }
    @Test void concurrentQualificationCreatesExactlyOneProspect() throws Exception {
        String name = "Concurrent-" + UUID.randomUUID();
        String leadId = create("/api/v1/crm/leads", Map.of("firstName", name));
        var executor = java.util.concurrent.Executors.newFixedThreadPool(2);
        try {
            var start = new java.util.concurrent.CountDownLatch(1);
            java.util.concurrent.Callable<Integer> qualify = () -> {
                start.await();
                return mvc.perform(post("/api/v1/crm/leads/" + leadId + "/qualify"))
                        .andReturn().getResponse().getStatus();
            };
            var first = executor.submit(qualify);
            var second = executor.submit(qualify);
            start.countDown();
            assertThat(List.of(first.get(10, java.util.concurrent.TimeUnit.SECONDS),
                    second.get(10, java.util.concurrent.TimeUnit.SECONDS))).containsExactly(200, 200);
            assertThat(jdbc.queryForObject("select count(*) from crm_prospects where primary_contact_name = ?", Integer.class, name)).isEqualTo(1);
            assertThat(jdbc.queryForObject("select count(*) from crm_lead_prospect_links l join crm_leads d on d.id=l.lead_id where d.first_name = ?", Integer.class, name)).isEqualTo(1);
        } finally { executor.shutdownNow(); }
    }

    @Test void leadHistoryIsAtomicOrderedAndPreventsHardDelete() throws Exception {
        String leadId = create("/api/v1/crm/leads", Map.of("firstName", "History", "companyName", "History Co"));
        Map<String, Object> update = new HashMap<>();
        update.put("firstName", "History"); update.put("companyName", "History Co"); update.put("status", "CONTACTED");
        mvc.perform(put("/api/v1/crm/leads/" + leadId).contentType("application/json").content(json(update)))
                .andExpect(status().isOk());
        mvc.perform(get("/api/v1/crm/leads/" + leadId + "/history"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.content[0].eventType").value("UPDATED"))
                .andExpect(jsonPath("$.content[0].fromStatus").value("NEW"))
                .andExpect(jsonPath("$.content[0].toStatus").value("CONTACTED"))
                .andExpect(jsonPath("$.content[1].eventType").value("CREATED"));
        mvc.perform(delete("/api/v1/crm/leads/" + leadId)).andExpect(status().isConflict());
        mvc.perform(get("/api/v1/crm/leads/" + leadId + "/history?page=0&size=0"))
                .andExpect(status().isBadRequest());
    }

    @Test void activitiesNotesAndAppointmentsValidateTargetsAndTimes() throws Exception {
        String leadId = create("/api/v1/crm/leads", Map.of("firstName", "Interaction"));
        Map<String, Object> target = Map.of("targetType", "LEAD", "targetId", leadId);
        Map<String, Object> activity = Map.of("target", target, "activityType", "CALL", "subject", "Intro call", "status", "PLANNED");
        String activityId = create("/api/v1/crm/activities", activity);
        mvc.perform(get("/api/v1/crm/activities?targetType=LEAD&targetId=" + leadId))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(1));
        Map<String, Object> completed = new HashMap<>(activity); completed.put("status", "COMPLETED");
        mvc.perform(put("/api/v1/crm/activities/" + activityId).contentType("application/json").content(json(completed)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.occurredAt").isNotEmpty());

        String noteId = create("/api/v1/crm/notes", Map.of("target", target, "content", "Called customer"));
        mvc.perform(get("/api/v1/crm/notes?targetType=LEAD&targetId=" + leadId))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].content").value("Called customer"));

        Map<String, Object> appointment = new HashMap<>(Map.of("target", target, "subject", "Discovery",
                "startsAt", "2030-01-01T10:00:00Z", "endsAt", "2030-01-01T11:00:00Z", "status", "SCHEDULED"));
        String appointmentId = create("/api/v1/crm/appointments", appointment);
        mvc.perform(get("/api/v1/crm/appointments?targetType=LEAD&targetId=" + leadId))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(1));
        appointment.put("endsAt", "2030-01-01T10:00:00Z");
        mvc.perform(post("/api/v1/crm/appointments").contentType("application/json").content(json(appointment)))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/v1/crm/notes").contentType("application/json")
                .content(json(Map.of("target", Map.of("targetType", "LEAD", "targetId", UUID.randomUUID()), "content", "orphan"))))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/api/v1/crm/activities/" + activityId)).andExpect(status().isNoContent());
        mvc.perform(delete("/api/v1/crm/notes/" + noteId)).andExpect(status().isNoContent());
        mvc.perform(delete("/api/v1/crm/appointments/" + appointmentId)).andExpect(status().isNoContent());
        mvc.perform(delete("/api/v1/crm/leads/" + leadId)).andExpect(status().isConflict());
    }

    @Test void opportunityHistoryCapturesStageAndOutcomeTransitions() throws Exception {
        String prospectId = create("/api/v1/crm/prospects", Map.of("companyName", "Stage History"));
        var stage = stages.save(CrmSalesStage.builder().name("Audit-" + UUID.randomUUID()).sequenceOrder(7).build());
        Map<String, Object> opportunity = new HashMap<>(Map.of("opportunityName", "Audit Deal", "prospectId", prospectId,
                "salesStageId", stage.getId(), "amount", 1250.00, "probability", 25));
        String opportunityId = create("/api/v1/crm/opportunities", opportunity);
        opportunity.put("status", "WON"); opportunity.put("probability", 100);
        mvc.perform(put("/api/v1/crm/opportunities/" + opportunityId).contentType("application/json").content(json(opportunity)))
                .andExpect(status().isOk());
        mvc.perform(get("/api/v1/crm/opportunities/" + opportunityId + "/history"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.content[0].eventType").value("UPDATED"))
                .andExpect(jsonPath("$.content[0].fromStatus").value("OPEN"))
                .andExpect(jsonPath("$.content[0].toStatus").value("WON"))
                .andExpect(jsonPath("$.content[0].fromProbability").value(25))
                .andExpect(jsonPath("$.content[0].toProbability").value(100))
                .andExpect(jsonPath("$.content[1].eventType").value("CREATED"));
        mvc.perform(delete("/api/v1/crm/opportunities/" + opportunityId)).andExpect(status().isConflict());
    }
    @Test void phase3MigrationUpgradesV2V3AndBaselinesExistingRowsInIsolation() throws Exception {
        String schema = "crm_upgrade_" + UUID.randomUUID().toString().replace("-", "");
        String url = System.getenv("CRM_TEST_DATABASE_URL");
        String username = System.getenv("CRM_TEST_DATABASE_USERNAME");
        String password = System.getenv("CRM_TEST_DATABASE_PASSWORD");
        jdbc.execute("CREATE SCHEMA " + schema);
        try {
            Flyway.configure().dataSource(url, username, password).schemas(schema).defaultSchema(schema)
                    .table("crm_flyway_schema_history").baselineOnMigrate(true)
                    .baselineVersion(MigrationVersion.fromVersion("1"))
                    .target(MigrationVersion.fromVersion("3")).locations("classpath:db/migration").load().migrate();
            UUID leadId = UUID.randomUUID();
            UUID opportunityId = UUID.randomUUID();
            jdbc.update("INSERT INTO " + schema + ".crm_leads(id, first_name, status) VALUES (?, ?, ?)", leadId, "Old lead", "CONTACTED");
            jdbc.update("INSERT INTO " + schema + ".crm_opportunities(id, opportunity_name, status, amount, probability) VALUES (?, ?, ?, ?, ?)", opportunityId, "Old deal", "OPEN", new java.math.BigDecimal("250.00"), 20);
            Flyway.configure().dataSource(url, username, password).schemas(schema).defaultSchema(schema)
                    .table("crm_flyway_schema_history").baselineOnMigrate(true)
                    .baselineVersion(MigrationVersion.fromVersion("1")).locations("classpath:db/migration").load().migrate();
            assertThat(jdbc.queryForObject("SELECT to_status FROM " + schema + ".crm_lead_history WHERE lead_id=? AND event_type='BASELINE'", String.class, leadId)).isEqualTo("CONTACTED");
            assertThat(jdbc.queryForObject("SELECT to_opportunity_name FROM " + schema + ".crm_opportunity_history WHERE opportunity_id=? AND event_type='BASELINE'", String.class, opportunityId)).isEqualTo("Old deal");
            assertThat(jdbc.queryForObject("SELECT count(*) FROM " + schema + ".crm_flyway_schema_history WHERE version='4' AND success", Integer.class)).isEqualTo(1);
        } finally {
            jdbc.execute("DROP SCHEMA " + schema + " CASCADE");
        }
    }

    @Test void foreignMigrationHistoryIsUntouched() {
        assertThat(jdbc.queryForObject("select marker from sales_review_sentinel", String.class)).isEqualTo("untouched");
        assertThat(jdbc.queryForObject("select marker from flyway_schema_history", String.class)).isEqualTo("foreign-history");
        assertThat(jdbc.queryForObject("select count(*) from crm_flyway_schema_history where success = true and version in ('2','3')", Integer.class)).isEqualTo(2);
    }

    @Test void contactsCompetitorsAndCustomer360WorkWithSalesUnavailable() throws Exception {
        String leadId = create("/api/v1/crm/leads", Map.of("firstName", "Contact owner"));
        String competitorId = create("/api/v1/crm/competitors", Map.of("name", "Rival-" + UUID.randomUUID(), "website", "https://rival.example"));
        String contactId = create("/api/v1/crm/contacts", Map.of("firstName", "Grace", "lastName", "Hopper", "email", "grace@example.test", "leadId", leadId, "primary", true));
        mvc.perform(get("/api/v1/crm/contacts?leadId=" + leadId))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].email").value("grace@example.test"));
        mvc.perform(post("/api/v1/crm/contacts").contentType("application/json")
                .content(json(Map.of("firstName", "Duplicate", "leadId", leadId, "primary", true))))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/v1/crm/contacts").contentType("application/json")
                .content(json(Map.of("firstName", "Invalid", "leadId", leadId, "customerId", UUID.randomUUID()))))
                .andExpect(status().isBadRequest());
        mvc.perform(put("/api/v1/crm/contacts/" + contactId).contentType("application/json")
                .content(json(Map.of("firstName", "Grace", "lastName", "Murray", "leadId", leadId, "primary", true))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.lastName").value("Murray"));

        String prospectId = create("/api/v1/crm/prospects", Map.of("companyName", "360 Prospect"));
        String opportunityId = create("/api/v1/crm/opportunities", Map.of("opportunityName", "360 Deal", "prospectId", prospectId));
        Map<String, Object> comparison = Map.of("competitorId", competitorId, "strengths", "Price", "weaknesses", "Coverage", "notes", "Incumbent");
        mvc.perform(post("/api/v1/crm/opportunities/" + opportunityId + "/competitors").contentType("application/json").content(json(comparison)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.competitorName").exists());
        mvc.perform(get("/api/v1/crm/opportunities/" + opportunityId + "/competitors"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].strengths").value("Price"));
        mvc.perform(post("/api/v1/crm/opportunities/" + opportunityId + "/competitors").contentType("application/json").content(json(comparison)))
                .andExpect(status().isConflict());
        mvc.perform(delete("/api/v1/crm/competitors/" + competitorId)).andExpect(status().isConflict());

        mvc.perform(get("/api/v1/crm/prospects/" + prospectId + "/360"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.prospects[0].id").value(prospectId))
                .andExpect(jsonPath("$.opportunities[0].id").value(opportunityId));
        mvc.perform(get("/api/v1/crm/customers/" + UUID.randomUUID() + "/360"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.salesStatus").value("UNAVAILABLE"));
        mvc.perform(delete("/api/v1/crm/opportunities/" + opportunityId)).andExpect(status().isConflict());
        mvc.perform(delete("/api/v1/crm/contacts/" + contactId)).andExpect(status().isNoContent());
    }

    @Test void phase4MigrationUpgradesV4SchemaAndCreatesOnlyCrmObjects() throws Exception {
        String schema = "crm_v5_" + UUID.randomUUID().toString().replace("-", "");
        String url = System.getenv("CRM_TEST_DATABASE_URL");
        String username = System.getenv("CRM_TEST_DATABASE_USERNAME");
        String password = System.getenv("CRM_TEST_DATABASE_PASSWORD");
        jdbc.execute("CREATE SCHEMA " + schema);
        try {
            Flyway.configure().dataSource(url, username, password).schemas(schema).defaultSchema(schema)
                    .table("crm_flyway_schema_history").baselineOnMigrate(true)
                    .baselineVersion(MigrationVersion.fromVersion("1")).target(MigrationVersion.fromVersion("4"))
                    .locations("classpath:db/migration").load().migrate();
            Flyway.configure().dataSource(url, username, password).schemas(schema).defaultSchema(schema)
                    .table("crm_flyway_schema_history").baselineOnMigrate(true)
                    .baselineVersion(MigrationVersion.fromVersion("1"))
                    .locations("classpath:db/migration").load().migrate();
            assertThat(jdbc.queryForObject("SELECT count(*) FROM " + schema + ".crm_flyway_schema_history WHERE version='5' AND success", Integer.class)).isEqualTo(1);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM information_schema.tables WHERE table_schema=? AND table_name IN ('crm_contacts','crm_competitors','crm_opportunity_competitors')", Integer.class, schema)).isEqualTo(3);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM " + schema + ".crm_flyway_schema_history WHERE success AND version IN ('2','3','4','5')", Integer.class)).isEqualTo(4);
        } finally {
            jdbc.execute("DROP SCHEMA " + schema + " CASCADE");
        }
    }

    @Test void phase5CampaignAttributionAndQualificationStayTransactional() throws Exception {
        String leadId=create("/api/v1/crm/leads",Map.of("firstName","Attribution","companyName","Campaign Co"));
        String campaignId=create("/api/v1/crm/campaigns",Map.of("name","Launch-"+UUID.randomUUID(),"channel","EVENT","budget",500,"currency","USD"));
        mvc.perform(post("/api/v1/crm/campaigns/"+campaignId+"/status").contentType("application/json").content(json(Map.of("status","ACTIVE"))))
                .andExpect(status().isOk());
        mvc.perform(post("/api/v1/crm/campaigns/"+campaignId+"/costs").contentType("application/json")
                .content(json(Map.of("amount",125.50,"currency","USD","costDate","2026-10-03","description","Launch venue"))))
                .andExpect(status().isCreated());
        String contactId=create("/api/v1/crm/contacts",Map.of("firstName","Attribution","leadId",leadId));
        String memberId=mapper.readTree(mvc.perform(post("/api/v1/crm/campaigns/"+campaignId+"/members").contentType("application/json").content(json(Map.of("contactId",contactId))))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).get("id").asText();
        mvc.perform(post("/api/v1/crm/campaigns/"+campaignId+"/members").contentType("application/json").content(json(Map.of("contactId",contactId))))
                .andExpect(status().isConflict());
        mvc.perform(put("/api/v1/crm/campaigns/"+campaignId+"/members/"+memberId).contentType("application/json").content(json(Map.of("status","CONTACTED"))))
                .andExpect(status().isOk());
        mvc.perform(get("/api/v1/crm/campaigns/"+campaignId+"/members?page=0&size=1"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/api/v1/crm/campaigns/"+campaignId+"/members/"+memberId+"/events"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(2));
        String eventKey="evt-"+UUID.randomUUID();
        Map<String,Object> touchpoint=Map.of("targetType","LEAD","targetId",leadId,"eventType","FORM_SUBMITTED","eventKey",eventKey,"utmSource","newsletter");
        String touchpointId=mapper.readTree(mvc.perform(post("/api/v1/crm/campaigns/"+campaignId+"/touchpoints").contentType("application/json").content(json(touchpoint)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).get("id").asText();
        String repeatedId=mapper.readTree(mvc.perform(post("/api/v1/crm/campaigns/"+campaignId+"/touchpoints").contentType("application/json").content(json(touchpoint)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).get("id").asText();
        assertThat(repeatedId).isEqualTo(touchpointId);
        String prospectId=mapper.readTree(mvc.perform(post("/api/v1/crm/leads/"+leadId+"/qualify?touchpointId="+touchpointId))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).get("id").asText();
        mvc.perform(get("/api/v1/crm/prospects/"+prospectId+"/attribution"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].link_type").value("QUALIFICATION"))
                .andExpect(jsonPath("$[0].utm_source").value("newsletter"));
        String opportunityId=create("/api/v1/crm/opportunities",Map.of("opportunityName","Attributed Deal","prospectId",prospectId,"attributionTouchpointId",touchpointId));
        mvc.perform(get("/api/v1/crm/opportunities/"+opportunityId+"/attribution"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].link_type").value("OPPORTUNITY_ASSOCIATION"));
        mvc.perform(get("/api/v1/crm/campaigns/"+campaignId+"/touchpoints"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(touchpointId));
    }

    @Test void phase5EmailQueueRequiresOptInAndUsesOfflineProviderSafely() throws Exception {
        String leadId=create("/api/v1/crm/leads",Map.of("firstName","Email","companyName","Email Co"));
        String contactId=create("/api/v1/crm/contacts",Map.of("firstName","Email","email","email@example.test","leadId",leadId));
        String templateName="Hello-"+UUID.randomUUID();
        String templateId=create("/api/v1/crm/message-templates",Map.of("name",templateName,"channel","EMAIL","subject","Hi {{firstName}}","body","Hello {{firstName}}"));
        String campaignId=create("/api/v1/crm/campaigns",Map.of("name","Email Campaign-"+UUID.randomUUID(),"channel","EMAIL"));
        mvc.perform(post("/api/v1/crm/campaigns/"+campaignId+"/status").contentType("application/json").content(json(Map.of("status","ACTIVE"))))
                .andExpect(status().isOk());
        mvc.perform(post("/api/v1/crm/campaigns/"+campaignId+"/members").contentType("application/json").content(json(Map.of("contactId",contactId))))
                .andExpect(status().isCreated());
        Map<String,Object> enqueue=new HashMap<>();enqueue.put("contactId",contactId);enqueue.put("campaignId",campaignId);enqueue.put("templateId",templateId);enqueue.put("idempotencyKey","mail-"+UUID.randomUUID());enqueue.put("variables",Map.of("firstName","Ada"));
        mvc.perform(post("/api/v1/crm/messages").contentType("application/json").content(json(enqueue))).andExpect(status().isBadRequest());
        mvc.perform(put("/api/v1/crm/contacts/"+contactId+"/communication-preferences/EMAIL").contentType("application/json")
                .content(json(Map.of("consentState","OPTED_IN","source","test fixture")))).andExpect(status().isOk());
        mvc.perform(get("/api/v1/crm/contacts/"+contactId+"/communication-preferences/EMAIL/events"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        var queued=mvc.perform(post("/api/v1/crm/messages").contentType("application/json").content(json(enqueue)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("QUEUED"))
                .andExpect(jsonPath("$.subject_snapshot").value("Hi Ada")).andReturn().getResponse().getContentAsString();
        String messageId=mapper.readTree(queued).get("id").asText();
        String repeated=mapper.readTree(mvc.perform(post("/api/v1/crm/messages").contentType("application/json").content(json(enqueue)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).get("id").asText();
        assertThat(repeated).isEqualTo(messageId);
        Map<String,Object> changed=new HashMap<>(enqueue);changed.put("variables",Map.of("firstName","Grace"));
        mvc.perform(post("/api/v1/crm/messages").contentType("application/json").content(json(changed))).andExpect(status().isConflict());
        messageWorker.deliver(messageWorker.claim());
        mvc.perform(get("/api/v1/crm/messages/"+messageId)).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("FAILED"))
                .andExpect(jsonPath("$.last_error").value(org.hamcrest.Matchers.containsString("delivery is disabled")));
        mvc.perform(get("/api/v1/crm/messages/"+messageId+"/attempts")).andExpect(status().isOk()).andExpect(jsonPath("$[0].result").value("FAILED"));
        String eventId="provider-"+UUID.randomUUID();String canonical="fixture:"+eventId+":"+messageId+":FAILED";
        String signature=hmac(canonical);
        Map<String,Object> event=Map.of("eventId",eventId,"messageId",messageId,"eventType","FAILED");
        mvc.perform(post("/api/v1/crm/provider-events/fixture").header("X-CRM-Signature",signature).contentType("application/json").content(json(event)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.verified").value(true));
        mvc.perform(post("/api/v1/crm/provider-events/fixture").header("X-CRM-Signature",signature).contentType("application/json").content(json(event)))
                .andExpect(status().isOk());
        mvc.perform(post("/api/v1/crm/provider-events/fixture").header("X-CRM-Signature","0".repeat(64)).contentType("application/json")
                .content(json(Map.of("eventId",eventId+"-bad","messageId",messageId,"eventType","FAILED")))).andExpect(status().isUnauthorized());
        mvc.perform(put("/api/v1/crm/message-templates/"+templateId).contentType("application/json")
                .content(json(Map.of("name",templateName,"channel","EMAIL","subject","New {{firstName}}","body","Updated {{firstName}}"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.revision").value(2));
        mvc.perform(get("/api/v1/crm/messages/"+messageId)).andExpect(status().isOk())
                .andExpect(jsonPath("$.subject_snapshot").value("Hi Ada")).andExpect(jsonPath("$.body_snapshot").value("Hello Ada"));
        Map<String,Object> second=new HashMap<>(enqueue);second.put("idempotencyKey","mail-recovery-"+UUID.randomUUID());
        String secondId=mapper.readTree(mvc.perform(post("/api/v1/crm/messages").contentType("application/json").content(json(second)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).get("id").asText();
        jdbc.update("UPDATE crm_messages SET status='PROCESSING',attempt_count=1,lease_until=CURRENT_TIMESTAMP-INTERVAL '1 second' WHERE id=?",UUID.fromString(secondId));
        jdbc.update("INSERT INTO crm_message_delivery_attempts(message_id,attempt_number,result) VALUES (?,1,'UNKNOWN')",UUID.fromString(secondId));
        assertThat(messageWorker.claim()).isNull();
        mvc.perform(get("/api/v1/crm/messages/"+secondId)).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UNKNOWN"));
    }

    @Test void phase5MigrationUpgradesV5SchemaWithCampaignAndMessageTables() throws Exception {
        String schema="crm_phase5_"+UUID.randomUUID().toString().replace("-","");
        String url=System.getenv("CRM_TEST_DATABASE_URL"),username=System.getenv("CRM_TEST_DATABASE_USERNAME"),password=System.getenv("CRM_TEST_DATABASE_PASSWORD");
        jdbc.execute("CREATE SCHEMA "+schema);
        try{
            Flyway.configure().dataSource(url,username,password).schemas(schema).defaultSchema(schema).table("crm_flyway_schema_history")
                    .baselineOnMigrate(true).baselineVersion(MigrationVersion.fromVersion("1")).target(MigrationVersion.fromVersion("5"))
                    .locations("classpath:db/migration").load().migrate();
            Flyway.configure().dataSource(url,username,password).schemas(schema).defaultSchema(schema).table("crm_flyway_schema_history")
                    .baselineOnMigrate(true).baselineVersion(MigrationVersion.fromVersion("1")).locations("classpath:db/migration").load().migrate();
            assertThat(jdbc.queryForObject("SELECT count(*) FROM "+schema+".crm_flyway_schema_history WHERE version='6' AND success",Integer.class)).isEqualTo(1);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM information_schema.tables WHERE table_schema=? AND table_name IN ('crm_campaigns','crm_campaign_costs','crm_campaign_members','crm_campaign_member_events','crm_campaign_touchpoints','crm_campaign_attribution_links','crm_message_templates','crm_communication_preferences','crm_communication_preference_events','crm_messages','crm_message_delivery_attempts','crm_provider_events')",Integer.class,schema)).isEqualTo(12);
        }finally{jdbc.execute("DROP SCHEMA "+schema+" CASCADE");}
    }
}
