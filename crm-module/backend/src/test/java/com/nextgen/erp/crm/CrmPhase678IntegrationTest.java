package com.nextgen.erp.crm;

import com.fasterxml.jackson.databind.*;
import com.nextgen.erp.crm.domain.model.CrmSalesStage;
import com.nextgen.erp.crm.repository.CrmSalesStageRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.flywaydb.core.Flyway;
import java.util.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
    "spring.datasource.url=${CRM_TEST_DATABASE_URL}",
    "spring.datasource.username=${CRM_TEST_DATABASE_USERNAME}",
    "spring.datasource.password=${CRM_TEST_DATABASE_PASSWORD}",
    "crm.communication.callback-secret=test-callback-secret"
})
@AutoConfigureMockMvc
class CrmPhase678IntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired JdbcTemplate jdbc;
    @Autowired CrmSalesStageRepository stages;
    private JsonNode getJson(String path) throws Exception {
        return mapper.readTree(mvc.perform(get(path)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
    }
    private JsonNode create(String path, Map<String, Object> body) throws Exception {
        return mapper.readTree(mvc.perform(post(path).contentType("application/json").content(mapper.writeValueAsString(body)))
            .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
    }
    private void changeStatus(String path, Map<String, Object> body) throws Exception {
        mvc.perform(post(path).contentType("application/json").content(mapper.writeValueAsString(body))).andExpect(status().isOk());
    }
    @Test void opportunityPreconditionPreservesReferencesAndRejectsStaleEdits() throws Exception {
        var stage = stages.save(CrmSalesStage.builder().name("Phase8-"+UUID.randomUUID()).sequenceOrder(1).build());
        String prospect = create("/api/v1/crm/prospects", Map.of("companyName","Phase8 prospect")).get("id").asText();
        String id = create("/api/v1/crm/opportunities", Map.of("opportunityName","Phase8 deal","prospectId",prospect,"amount",123.45,"probability",20)).get("id").asText();
        var original = getJson("/api/v1/crm/opportunities/"+id);
        Map<String,Object> body = new HashMap<>(Map.of("opportunityName","Phase8 deal", "prospectId",prospect,"amount",123.45,"probability",20,
            "status","OPEN","salesStageId",stage.getId(),"expectedUpdatedAt",original.get("updatedAt").asText()));
        mvc.perform(put("/api/v1/crm/opportunities/"+id).contentType("application/json").content(mapper.writeValueAsString(body)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.prospect.id").value(prospect)).andExpect(jsonPath("$.amount").value(123.45));
        body.put("opportunityName","Stale overwrite");
        mvc.perform(put("/api/v1/crm/opportunities/"+id).contentType("application/json").content(mapper.writeValueAsString(body))).andExpect(status().isConflict());
        assertThat(getJson("/api/v1/crm/opportunities/"+id).get("opportunityName").asText()).isEqualTo("Phase8 deal");
        mvc.perform(get("/api/v1/crm/lookups")).andExpect(status().isOk()).andExpect(jsonPath("$.salesStages").isArray());
        mvc.perform(post("/api/v1/crm/opportunities").contentType("application/json").content("{}"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.fields.opportunityName").exists());
    }
    @Test void warrantyBoundariesAndContractLifecycleAreTransactional() throws Exception {
        String customer=UUID.randomUUID().toString();
        String contract=create("/api/v1/crm/contracts",Map.of("contractNumber",UUID.randomUUID().toString(),"name","Service contract","customerId",customer,"totalAmount",200,"currency","USD")).get("id").asText();
        String item=create("/api/v1/crm/contracts/"+contract+"/items",Map.of("description","Pump snapshot","quantity",1,"unit","each","unitPrice",200,"warrantyStartsOn","2026-01-01","warrantyEndsOn","2026-12-31")).get("id").asText();
        for (String date:List.of("2026-01-01","2026-12-31")) create("/api/v1/crm/warranty-claims",Map.of("claimNumber",UUID.randomUUID().toString(),"contractId",contract,"contractItemId",item,"issue","Boundary","description","Review coverage","reportedOn",date));
        for (String date:List.of("2025-12-31","2027-01-01")) mvc.perform(post("/api/v1/crm/warranty-claims").contentType("application/json").content(mapper.writeValueAsString(Map.of("claimNumber",UUID.randomUUID().toString(),"contractId",contract,"contractItemId",item,"issue","Outside","description","Outside coverage","reportedOn",date)))).andExpect(status().isBadRequest());
        String claim=create("/api/v1/crm/warranty-claims",Map.of("claimNumber",UUID.randomUUID().toString(),"contractId",contract,"contractItemId",item,"issue","Repair","description","Broken pump","reportedOn","2026-06-01")).get("id").asText();
        mvc.perform(post("/api/v1/crm/warranty-claims/"+claim+"/status").contentType("application/json").content("{\"status\":\"RESOLVED\"}")).andExpect(status().isBadRequest());
        changeStatus("/api/v1/crm/warranty-claims/"+claim+"/status",Map.of("status","UNDER_REVIEW"));
        changeStatus("/api/v1/crm/warranty-claims/"+claim+"/status",Map.of("status","APPROVED"));
        mvc.perform(post("/api/v1/crm/warranty-claims/"+claim+"/status").contentType("application/json").content("{\"status\":\"RESOLVED\"}")).andExpect(status().isBadRequest());
        changeStatus("/api/v1/crm/warranty-claims/"+claim+"/status",Map.of("status","RESOLVED","resolution","Repaired"));
        assertThat(getJson("/api/v1/crm/warranty-claims/"+claim+"/events").size()).isEqualTo(4);
        changeStatus("/api/v1/crm/contracts/"+contract+"/status",Map.of("status","ACTIVE","version",0));
        mvc.perform(post("/api/v1/crm/contracts/"+contract+"/items").contentType("application/json").content("{\"description\":\"Late item\",\"quantity\":1,\"unit\":\"each\",\"unitPrice\":1}")).andExpect(status().isConflict());
        String fulfilment=create("/api/v1/crm/fulfilments",Map.of("contractId",contract,"contractItemId",item,"fulfilmentType","DELIVERY","description","Delivery","plannedQuantity",1,"completedQuantity",0)).get("id").asText();
        mvc.perform(post("/api/v1/crm/fulfilments/"+fulfilment+"/status").contentType("application/json").content("{\"status\":\"COMPLETED\",\"completedQuantity\":0}")).andExpect(status().isBadRequest());
        changeStatus("/api/v1/crm/fulfilments/"+fulfilment+"/status",Map.of("status","COMPLETED","completedQuantity",1));
        assertThat(getJson("/api/v1/crm/fulfilments/"+fulfilment).get("status").asText()).isEqualTo("COMPLETED");
    }
    @Test void maintenanceRecursInItsTimezoneAndEndsWithoutDuplicateVisits() throws Exception {
        String id=create("/api/v1/crm/maintenance-schedules",Map.of("name","DST maintenance","customerId",UUID.randomUUID(),"startsOn","2026-03-07","endsOn","2026-03-09","intervalDays",1,"nextDueOn","2026-03-07","timezone","America/New_York")).get("id").asText();
        String first=create("/api/v1/crm/maintenance-schedules/"+id+"/visits",Map.of("dueAt","2026-03-07T09:00:00-05:00")).get("id").asText();
        mvc.perform(post("/api/v1/crm/maintenance-schedules/"+id+"/visits").contentType("application/json").content("{\"dueAt\":\"2026-03-07T09:00:00-05:00\"}")).andExpect(status().isConflict());
        changeStatus("/api/v1/crm/maintenance-visits/"+first+"/status",Map.of("status","COMPLETED"));
        assertThat(getJson("/api/v1/crm/maintenance-schedules/"+id).get("next_due_on").asText()).isEqualTo("2026-03-08");
        changeStatus("/api/v1/crm/maintenance-visits/"+first+"/status",Map.of("status","COMPLETED"));
        String finalVisit=create("/api/v1/crm/maintenance-schedules/"+id+"/visits",Map.of("dueAt","2026-03-09T09:00:00-04:00")).get("id").asText();
        changeStatus("/api/v1/crm/maintenance-visits/"+finalVisit+"/status",Map.of("status","COMPLETED"));
        assertThat(getJson("/api/v1/crm/maintenance-schedules/"+id).get("status").asText()).isEqualTo("COMPLETED");
        mvc.perform(post("/api/v1/crm/maintenance-schedules/"+id+"/visits").contentType("application/json").content("{\"dueAt\":\"2026-03-10T09:00:00-04:00\"}")).andExpect(status().isConflict());
    }
    @Test void analyticsFiltersCurrencyAndStageEntryUseVerifiedFixtures() throws Exception {
        UUID owner=UUID.randomUUID(), customer=UUID.randomUUID();
        String lead=create("/api/v1/crm/leads",Map.of("firstName","Analytics","assignedTo",owner)).get("id").asText();
        mvc.perform(post("/api/v1/crm/leads/"+lead+"/qualify")).andExpect(status().isOk());
        jdbc.update("UPDATE crm_leads SET created_at='2026-01-02 23:59:59.999999' WHERE id=?",UUID.fromString(lead));
        var stage=stages.save(CrmSalesStage.builder().name("Duration-"+UUID.randomUUID()).sequenceOrder(10).build());
        String opportunity=create("/api/v1/crm/opportunities",Map.of("opportunityName","Duration fixture","customerId",customer,"assignedTo",owner,"amount",80,"salesStageId",stage.getId())).get("id").asText();
        jdbc.update("UPDATE crm_opportunity_history SET occurred_at=CURRENT_TIMESTAMP-INTERVAL '10 days' WHERE opportunity_id=?",UUID.fromString(opportunity));
        jdbc.update("INSERT INTO crm_opportunity_history(id,opportunity_id,event_type,from_stage_id,to_stage_id,occurred_at) VALUES (?,?, 'UPDATED',?,?,CURRENT_TIMESTAMP-INTERVAL '1 day')",UUID.randomUUID(),UUID.fromString(opportunity),stage.getId(),stage.getId());
        var overview=getJson("/api/v1/crm/analytics/overview?from=2026-01-02&to=2026-01-02&ownerId="+owner);
        assertThat(overview.at("/counts/leads_created").asInt()).isEqualTo(1);
        assertThat(overview.at("/rates/leadQualificationRate").asDouble()).isEqualTo(1.0);
        assertThat(getJson("/api/v1/crm/analytics/overview?from=2026-01-01&to=2026-01-01&ownerId="+owner).at("/rates/leadQualificationRate").asDouble()).isZero();
        var pipeline=getJson("/api/v1/crm/analytics/pipeline?from=2026-01-01&to=2026-01-02&ownerId="+owner);
        assertThat(pipeline.at("/stages/0/opportunities").asInt()).isEqualTo(1);
        assertThat(pipeline.at("/stages/0/avg_days_in_current_stage").asDouble()).isGreaterThanOrEqualTo(10.0);
        for(String currency:List.of("USD","INR")) create("/api/v1/crm/contracts",Map.of("contractNumber",UUID.randomUUID().toString(),"name","Currency fixture","customerId",customer,"totalAmount",20,"currency",currency));
        var service=getJson("/api/v1/crm/analytics/service?customerId="+customer);
        assertThat(service.get("contractAmountsByCurrency").size()).isEqualTo(2);
        for(var amount:service.get("contractAmountsByCurrency")) assertThat(amount.get("amount").asDouble()).isEqualTo(20);
        mvc.perform(get("/api/v1/crm/analytics/funnel?from=2026-02-01&to=2026-01-01")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/crm/analytics/service?from=2000-01-01&to=2026-01-01")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/crm/analytics/overview?to=2099-01-01")).andExpect(status().isBadRequest());
    }
    @Test void v6UpgradePreservesRecordsAndAppliesServiceTablesAndReportingIndexes() {
        String schema="crm_v8_"+UUID.randomUUID().toString().replace("-", "");
        jdbc.execute("CREATE SCHEMA "+schema);
        try {
            var config=Flyway.configure().dataSource(System.getenv("CRM_TEST_DATABASE_URL"),System.getenv("CRM_TEST_DATABASE_USERNAME"),System.getenv("CRM_TEST_DATABASE_PASSWORD"))
                .schemas(schema).defaultSchema(schema).table("crm_flyway_schema_history").locations("classpath:db/migration");
            config.target("6").load().migrate();
            UUID id=UUID.randomUUID();
            jdbc.update("INSERT INTO "+schema+".crm_leads(id,first_name,status) VALUES (?, 'Preserved', 'NEW')",id);
            config.target("8").load().migrate();
            assertThat(jdbc.queryForObject("SELECT first_name FROM "+schema+".crm_leads WHERE id=?",String.class,id)).isEqualTo("Preserved");
            assertThat(jdbc.queryForObject("SELECT count(*) FROM "+schema+".crm_flyway_schema_history WHERE version IN ('7','8') AND success",Integer.class)).isEqualTo(2);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM information_schema.tables WHERE table_schema=? AND table_name NOT LIKE 'crm_%'",Integer.class,schema)).isZero();
        } finally { jdbc.execute("DROP SCHEMA "+schema+" CASCADE"); }
    }
    @Test void unfilteredFrontendQueriesWorkWithNullOptionalFilters() throws Exception {
        for(String path:List.of("/campaigns","/contracts","/fulfilments","/warranty-claims","/maintenance-schedules","/messages",
            "/analytics/overview","/analytics/funnel","/analytics/pipeline","/analytics/campaigns","/analytics/service")) {
            mvc.perform(get("/api/v1/crm"+path)).andExpect(status().isOk());
        }
    }
    @Test void completingOverdueVisitsCannotMoveNextDueBackwards() throws Exception {
        String id=create("/api/v1/crm/maintenance-schedules",Map.of("name","Overdue visits","customerId",UUID.randomUUID(),"startsOn","2026-01-01","intervalDays",1,"nextDueOn","2026-01-01","timezone","UTC")).get("id").asText();
        String early=create("/api/v1/crm/maintenance-schedules/"+id+"/visits",Map.of("dueAt","2026-01-01T09:00:00Z")).get("id").asText();
        String late=create("/api/v1/crm/maintenance-schedules/"+id+"/visits",Map.of("dueAt","2026-01-03T09:00:00Z")).get("id").asText();
        changeStatus("/api/v1/crm/maintenance-visits/"+late+"/status",Map.of("status","COMPLETED"));
        changeStatus("/api/v1/crm/maintenance-visits/"+early+"/status",Map.of("status","COMPLETED"));
        assertThat(getJson("/api/v1/crm/maintenance-schedules/"+id).get("next_due_on").asText()).isEqualTo("2026-01-04");
        String pending=create("/api/v1/crm/maintenance-schedules/"+id+"/visits",Map.of("dueAt","2026-01-04T09:00:00Z")).get("id").asText();
        changeStatus("/api/v1/crm/maintenance-schedules/"+id+"/status",Map.of("status","PAUSED"));
        mvc.perform(post("/api/v1/crm/maintenance-visits/"+pending+"/status").contentType("application/json").content("{\"status\":\"COMPLETED\"}")).andExpect(status().isConflict());
        assertThat(getJson("/api/v1/crm/maintenance-schedules/"+id+"/visits").toString()).contains("PLANNED");
    }
}
