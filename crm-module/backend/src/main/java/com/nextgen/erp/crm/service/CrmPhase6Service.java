package com.nextgen.erp.crm.service;

import com.nextgen.erp.crm.dto.phase6.Phase6Requests.*;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.namedparam.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityNotFoundException;
import java.time.*;
import java.util.*;

@Service @RequiredArgsConstructor
public class CrmPhase6Service {
    private final NamedParameterJdbcTemplate db;

    @Transactional(readOnly=true) public List<Map<String,Object>> contracts(int page,int size,String status,UUID customerId){
        MapSqlParameterSource p=pageParams(page,size).addValue("status",status).addValue("customer",customerId);
        return db.queryForList("SELECT * FROM crm_contracts WHERE (CAST(:status AS text) IS NULL OR status=:status) AND (CAST(:customer AS uuid) IS NULL OR customer_id=:customer) ORDER BY created_at DESC,id DESC LIMIT :limit OFFSET :offset",p);
    }
    @Transactional(readOnly=true) public Map<String,Object> contract(UUID id){return one("SELECT * FROM crm_contracts WHERE id=:id",Map.of("id",id));}
    @Transactional public Map<String,Object> createContract(Contract r){
        validateDates(r.startsOn(),r.endsOn());
        if(r.opportunityId()==null&&r.customerId()==null)throw new IllegalArgumentException("A contract must reference a CRM opportunity or customer UUID");
        if(r.opportunityId()!=null&&!exists("SELECT EXISTS(SELECT 1 FROM crm_opportunities WHERE id=:id)",Map.of("id",r.opportunityId())))throw notFound("CRM opportunity");
        MapSqlParameterSource p=new MapSqlParameterSource().addValue("number",r.contractNumber().trim()).addValue("name",r.name().trim()).addValue("opportunity",r.opportunityId()).addValue("customer",r.customerId()).addValue("starts",r.startsOn()).addValue("ends",r.endsOn()).addValue("amount",r.totalAmount()).addValue("currency",r.currency()).addValue("notes",r.notes());
        Map<String,Object> saved=one("INSERT INTO crm_contracts(contract_number,name,opportunity_id,customer_id,starts_on,ends_on,total_amount,currency,notes) VALUES(:number,:name,:opportunity,:customer,:starts,:ends,:amount,:currency,:notes) RETURNING *",p);
        db.update("INSERT INTO crm_contract_events(contract_id,to_status) VALUES(:id,'DRAFT')",Map.of("id",saved.get("id")));
        return saved;
    }
    @Transactional public Map<String,Object> updateContract(UUID id,Contract r){
        validateDates(r.startsOn(),r.endsOn());if(r.opportunityId()==null&&r.customerId()==null)throw new IllegalArgumentException("A contract must reference a CRM opportunity or customer UUID");
        Map<String,Object> current=one("SELECT * FROM crm_contracts WHERE id=:id FOR UPDATE",Map.of("id",id));
        if(!"DRAFT".equals(current.get("status")))throw new CrmConflictException("Only draft contract terms can be edited");
        if(r.version()==null||((Number)current.get("version")).longValue()!=r.version())throw new CrmConflictException("Contract version is missing or stale");
        if(r.opportunityId()!=null&&!exists("SELECT EXISTS(SELECT 1 FROM crm_opportunities WHERE id=:id)",Map.of("id",r.opportunityId())))throw notFound("CRM opportunity");
        MapSqlParameterSource p=new MapSqlParameterSource().addValue("id",id).addValue("version",r.version()).addValue("number",r.contractNumber().trim()).addValue("name",r.name().trim()).addValue("opportunity",r.opportunityId()).addValue("customer",r.customerId()).addValue("starts",r.startsOn()).addValue("ends",r.endsOn()).addValue("amount",r.totalAmount()).addValue("currency",r.currency()).addValue("notes",r.notes());
        int n=db.update("UPDATE crm_contracts SET contract_number=:number,name=:name,opportunity_id=:opportunity,customer_id=:customer,starts_on=:starts,ends_on=:ends,total_amount=:amount,currency=:currency,notes=:notes,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=:id AND version=:version",p);
        if(n==0)throw new CrmConflictException("Contract version is stale");return contract(id);
    }
    @Transactional public Map<String,Object> addContractItem(UUID id,ContractItem r){
        Map<String,Object> c=contract(id);validateDates(r.warrantyStartsOn(),r.warrantyEndsOn());
        if(!"DRAFT".equals(c.get("status")))throw new CrmConflictException("Items can only be added to a draft contract");
        return one("INSERT INTO crm_contract_items(contract_id,external_product_id,description,quantity,unit,unit_price,warranty_starts_on,warranty_ends_on) VALUES(:contract,:product,:description,:quantity,:unit,:price,:warrantyStart,:warrantyEnd) RETURNING *",
            new MapSqlParameterSource().addValue("contract",id).addValue("product",r.externalProductId()).addValue("description",r.description().trim()).addValue("quantity",r.quantity()).addValue("unit",r.unit().trim()).addValue("price",r.unitPrice()).addValue("warrantyStart",r.warrantyStartsOn()).addValue("warrantyEnd",r.warrantyEndsOn()));
    }
    @Transactional(readOnly=true) public List<Map<String,Object>> contractItems(UUID id){contract(id);return db.queryForList("SELECT * FROM crm_contract_items WHERE contract_id=:id ORDER BY created_at,id LIMIT 500",Map.of("id",id));}
    @Transactional public Map<String,Object> changeContractStatus(UUID id,ContractStatus r){
        Map<String,Object> c=one("SELECT * FROM crm_contracts WHERE id=:id FOR UPDATE",Map.of("id",id));String from=(String)c.get("status"),to=r.status().toUpperCase(Locale.ROOT);
        if(r.version()!=null&&((Number)c.get("version")).longValue()!=r.version())throw new CrmConflictException("Contract version is stale");
        Map<String,Set<String>> allowed=Map.of("DRAFT",Set.of("ACTIVE","TERMINATED"),"ACTIVE",Set.of("EXPIRED","TERMINATED"),"EXPIRED",Set.of(),"TERMINATED",Set.of());
        if(!allowed.containsKey(to))throw new IllegalArgumentException("Unknown contract status");if(!from.equals(to)&&!allowed.get(from).contains(to))throw new IllegalArgumentException("Contract status transition is not allowed");
        if(!from.equals(to)){db.update("UPDATE crm_contracts SET status=:to,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=:id",Map.of("id",id,"to",to));db.update("INSERT INTO crm_contract_events(contract_id,from_status,to_status) VALUES(:id,:from,:to)",Map.of("id",id,"from",from,"to",to));}
        return contract(id);
    }
    @Transactional(readOnly=true) public List<Map<String,Object>> contractEvents(UUID id){contract(id);return db.queryForList("SELECT * FROM crm_contract_events WHERE contract_id=:id ORDER BY occurred_at DESC,id DESC LIMIT 100",Map.of("id",id));}

    @Transactional(readOnly=true) public List<Map<String,Object>> fulfilments(int page,int size,UUID contractId,String status){
        if(contractId!=null)contract(contractId);return db.queryForList("SELECT * FROM crm_fulfilments WHERE (CAST(:contract AS uuid) IS NULL OR contract_id=:contract) AND (CAST(:status AS text) IS NULL OR status=:status) ORDER BY COALESCE(planned_at,created_at) DESC,id DESC LIMIT :limit OFFSET :offset",pageParams(page,size).addValue("contract",contractId).addValue("status",status));
    }
    @Transactional public Map<String,Object> createFulfilment(Fulfilment r){
        Map<String,Object> c=contract(r.contractId());if(Set.of("EXPIRED","TERMINATED").contains(c.get("status")))throw new CrmConflictException("Fulfilment cannot be added to an inactive contract");
        validateEnum(r.fulfilmentType(),Set.of("DELIVERY","SERVICE"),"fulfilment type");
        if(r.contractItemId()!=null&&!exists("SELECT EXISTS(SELECT 1 FROM crm_contract_items WHERE id=:item AND contract_id=:contract)",Map.of("item",r.contractItemId(),"contract",r.contractId())))throw notFound("Contract item");
        if(r.completedAt()!=null&&r.completedQuantity().signum()==0)throw new IllegalArgumentException("completedQuantity must be positive when completedAt is supplied");
        return one("INSERT INTO crm_fulfilments(contract_id,contract_item_id,fulfilment_type,description,planned_quantity,completed_quantity,planned_at,completed_at,external_reference,status) VALUES(:contract,:item,:type,:description,:plannedQuantity,:completedQuantity,:planned,:completed,:reference,:status) RETURNING *",
            new MapSqlParameterSource().addValue("contract",r.contractId()).addValue("item",r.contractItemId()).addValue("type",r.fulfilmentType().toUpperCase(Locale.ROOT)).addValue("description",r.description().trim()).addValue("plannedQuantity",r.plannedQuantity()).addValue("completedQuantity",r.completedQuantity()).addValue("planned",r.plannedAt()).addValue("completed",r.completedAt()).addValue("reference",r.externalReference()).addValue("status",r.completedAt()!=null?"COMPLETED":r.completedQuantity().signum()>0?"IN_PROGRESS":"PLANNED"));
    }
    @Transactional public Map<String,Object> changeFulfilmentStatus(UUID id,FulfilmentStatus r){
        Map<String,Object> f=one("SELECT * FROM crm_fulfilments WHERE id=:id FOR UPDATE",Map.of("id",id));String from=(String)f.get("status"),to=r.status().toUpperCase(Locale.ROOT);validateEnum(to,Set.of("PLANNED","IN_PROGRESS","COMPLETED","CANCELLED"),"fulfilment status");
        if(!Map.of("PLANNED",Set.of("IN_PROGRESS","COMPLETED","CANCELLED"),"IN_PROGRESS",Set.of("COMPLETED","CANCELLED"),"COMPLETED",Set.of(),"CANCELLED",Set.of()).get(from).contains(to)&&!from.equals(to))throw new IllegalArgumentException("Fulfilment status transition is not allowed");
        java.math.BigDecimal completed=r.completedQuantity()==null?(java.math.BigDecimal)f.get("completed_quantity"):r.completedQuantity();
        java.time.OffsetDateTime completedAt=r.completedAt()==null?asOffsetDateTime(f.get("completed_at")):r.completedAt();
        if("COMPLETED".equals(to)){if(completed.signum()<=0)throw new IllegalArgumentException("A completed fulfilment needs a positive completedQuantity");if(completedAt==null)completedAt=OffsetDateTime.now(ZoneOffset.UTC);}
        if("CANCELLED".equals(to)&&completed.signum()>0)throw new IllegalArgumentException("A fulfilment with completed quantity cannot be cancelled");
        db.update("UPDATE crm_fulfilments SET status=:status,completed_quantity=:quantity,completed_at=:completed,updated_at=CURRENT_TIMESTAMP WHERE id=:id",new MapSqlParameterSource().addValue("id",id).addValue("status",to).addValue("quantity",completed).addValue("completed",completedAt));
        return one("SELECT * FROM crm_fulfilments WHERE id=:id",Map.of("id",id));
    }

    @Transactional(readOnly=true) public List<Map<String,Object>> claims(int page,int size,String status,UUID customerId){return db.queryForList("SELECT * FROM crm_warranty_claims WHERE (CAST(:status AS text) IS NULL OR status=:status) AND (CAST(:customer AS uuid) IS NULL OR customer_id=:customer) ORDER BY reported_on DESC,id DESC LIMIT :limit OFFSET :offset",pageParams(page,size).addValue("status",status).addValue("customer",customerId));}
    @Transactional(readOnly=true) public Map<String,Object> claim(UUID id){return one("SELECT * FROM crm_warranty_claims WHERE id=:id",Map.of("id",id));}
    @Transactional public Map<String,Object> createClaim(WarrantyClaim r){
        Map<String,Object> c=contract(r.contractId());if(r.contractItemId()==null)throw new IllegalArgumentException("contractItemId is required to validate warranty coverage");
        Map<String,Object> item=one("SELECT * FROM crm_contract_items WHERE id=:item AND contract_id=:contract",Map.of("item",r.contractItemId(),"contract",r.contractId()));
        LocalDate reported=r.reportedOn()==null?LocalDate.now(ZoneOffset.UTC):r.reportedOn();Object start=item.get("warranty_starts_on"),end=item.get("warranty_ends_on");
        if(start==null||end==null)throw new IllegalArgumentException("Contract item has no complete warranty period");
        if(reported.isBefore(asLocalDate(start))||reported.isAfter(asLocalDate(end)))throw new IllegalArgumentException("Claim date is outside the recorded warranty period");
        UUID customer=r.customerId();if(customer==null)customer=(UUID)c.get("customer_id");else if(c.get("customer_id")!=null&&!customer.equals(c.get("customer_id")))throw new IllegalArgumentException("customerId does not match contract customer");
        Map<String,Object> saved=one("INSERT INTO crm_warranty_claims(claim_number,contract_id,contract_item_id,customer_id,issue,description,reported_on) VALUES(:number,:contract,:item,:customer,:issue,:description,:reported) RETURNING *",
            new MapSqlParameterSource().addValue("number",r.claimNumber().trim()).addValue("contract",r.contractId()).addValue("item",r.contractItemId()).addValue("customer",customer).addValue("issue",r.issue().trim()).addValue("description",r.description()).addValue("reported",reported));
        db.update("INSERT INTO crm_warranty_claim_events(claim_id,to_status) VALUES(:id,'SUBMITTED')",Map.of("id",saved.get("id")));return saved;
    }
    @Transactional public Map<String,Object> changeClaimStatus(UUID id,ClaimStatus r){
        Map<String,Object> c=one("SELECT * FROM crm_warranty_claims WHERE id=:id FOR UPDATE",Map.of("id",id));String from=(String)c.get("status"),to=r.status().toUpperCase(Locale.ROOT);
        Map<String,Set<String>> allowed=Map.of("SUBMITTED",Set.of("UNDER_REVIEW","WITHDRAWN"),"UNDER_REVIEW",Set.of("APPROVED","REJECTED","WITHDRAWN"),"APPROVED",Set.of("RESOLVED"),"REJECTED",Set.of(),"RESOLVED",Set.of(),"WITHDRAWN",Set.of());
        if(!allowed.containsKey(to))throw new IllegalArgumentException("Unknown warranty claim status");if(!from.equals(to)&&!allowed.get(from).contains(to))throw new IllegalArgumentException("Warranty claim status transition is not allowed");
        String resolution=r.resolution();if("RESOLVED".equals(to)&&(resolution==null||resolution.isBlank()))throw new IllegalArgumentException("resolution is required when resolving a claim");
        if(!from.equals(to)){db.update("UPDATE crm_warranty_claims SET status=:status,resolution=COALESCE(:resolution,resolution),resolved_at=CASE WHEN :status='RESOLVED' THEN CURRENT_TIMESTAMP ELSE resolved_at END,updated_at=CURRENT_TIMESTAMP WHERE id=:id",new MapSqlParameterSource().addValue("id",id).addValue("status",to).addValue("resolution",resolution));db.update("INSERT INTO crm_warranty_claim_events(claim_id,from_status,to_status,note) VALUES(:id,:from,:to,:note)",new MapSqlParameterSource().addValue("id",id).addValue("from",from).addValue("to",to).addValue("note",r.note()));}
        return claim(id);
    }
    @Transactional(readOnly=true) public List<Map<String,Object>> claimEvents(UUID id){claim(id);return db.queryForList("SELECT * FROM crm_warranty_claim_events WHERE claim_id=:id ORDER BY occurred_at DESC,id DESC LIMIT 100",Map.of("id",id));}

    @Transactional(readOnly=true) public List<Map<String,Object>> schedules(int page,int size,UUID customerId,String status){return db.queryForList("SELECT * FROM crm_maintenance_schedules WHERE (CAST(:customer AS uuid) IS NULL OR customer_id=:customer) AND (CAST(:status AS text) IS NULL OR status=:status) ORDER BY next_due_on,id LIMIT :limit OFFSET :offset",pageParams(page,size).addValue("customer",customerId).addValue("status",status));}
    @Transactional public Map<String,Object> createSchedule(MaintenanceSchedule r){
        validateDates(r.startsOn(),r.endsOn());if(r.nextDueOn().isBefore(r.startsOn())||(r.endsOn()!=null&&r.nextDueOn().isAfter(r.endsOn())))throw new IllegalArgumentException("nextDueOn must be within the schedule date range");
        if(r.contractId()!=null){contract(r.contractId());if(r.contractItemId()!=null&&!exists("SELECT EXISTS(SELECT 1 FROM crm_contract_items WHERE id=:item AND contract_id=:contract)",Map.of("item",r.contractItemId(),"contract",r.contractId())))throw notFound("Contract item");}else if(r.contractItemId()!=null)throw new IllegalArgumentException("contractId is required when contractItemId is supplied");
        ZoneId zone;try{zone=ZoneId.of(r.timezone());}catch(Exception e){throw new IllegalArgumentException("timezone must be a valid IANA timezone");}
        return one("INSERT INTO crm_maintenance_schedules(customer_id,contract_id,contract_item_id,name,description,starts_on,ends_on,interval_days,next_due_on,timezone) VALUES(:customer,:contract,:item,:name,:description,:starts,:ends,:interval,:due,:timezone) RETURNING *",
            new MapSqlParameterSource().addValue("customer",r.customerId()).addValue("contract",r.contractId()).addValue("item",r.contractItemId()).addValue("name",r.name().trim()).addValue("description",r.description()).addValue("starts",r.startsOn()).addValue("ends",r.endsOn()).addValue("interval",r.intervalDays()).addValue("due",r.nextDueOn()).addValue("timezone",zone.getId()));
    }
    @Transactional(readOnly=true) public List<Map<String,Object>> visits(UUID id){schedule(id);return db.queryForList("SELECT * FROM crm_maintenance_visits WHERE schedule_id=:id ORDER BY due_at,id LIMIT 500",Map.of("id",id));}
    @Transactional public Map<String,Object> createVisit(UUID id,MaintenanceVisit r){Map<String,Object>s=schedule(id);if(!"ACTIVE".equals(s.get("status")))throw new CrmConflictException("Visits can only be added to active schedules");return one("INSERT INTO crm_maintenance_visits(schedule_id,due_at,assigned_to,notes) VALUES(:id,:due,:assignee,:notes) RETURNING *",new MapSqlParameterSource().addValue("id",id).addValue("due",r.dueAt()).addValue("assignee",r.assignedTo()).addValue("notes",r.notes()));}
    @Transactional public Map<String,Object> changeVisitStatus(UUID id,VisitStatus r){Map<String,Object> v=one("SELECT * FROM crm_maintenance_visits WHERE id=:id FOR UPDATE",Map.of("id",id));String from=(String)v.get("status"),to=r.status().toUpperCase(Locale.ROOT);Map<String,Set<String>> transitions=Map.of("PLANNED",Set.of("COMPLETED","CANCELLED","MISSED"),"COMPLETED",Set.of(),"CANCELLED",Set.of(),"MISSED",Set.of());if(!transitions.containsKey(to))throw new IllegalArgumentException("Unknown maintenance visit status");if(from.equals(to))return v;if(!transitions.get(from).contains(to))throw new IllegalArgumentException("Maintenance visit status transition is not allowed");OffsetDateTime at=r.completedAt();if("COMPLETED".equals(to)&&at==null)at=OffsetDateTime.now(ZoneOffset.UTC);db.update("UPDATE crm_maintenance_visits SET status=:status,completed_at=:completed,notes=COALESCE(:notes,notes),updated_at=CURRENT_TIMESTAMP WHERE id=:id",new MapSqlParameterSource().addValue("id",id).addValue("status",to).addValue("completed",at).addValue("notes",r.notes()));if("COMPLETED".equals(to)){Map<String,Object>s=one("SELECT s.* FROM crm_maintenance_schedules s WHERE s.id=:id FOR UPDATE",Map.of("id",v.get("schedule_id")));if(!"ACTIVE".equals(s.get("status")))throw new CrmConflictException("Only active schedules can complete visits");ZoneId zone=ZoneId.of((String)s.get("timezone"));LocalDate due=asOffsetDateTime(v.get("due_at")).atZoneSameInstant(zone).toLocalDate();LocalDate next=due.plusDays(((Number)s.get("interval_days")).longValue());LocalDate end=s.get("ends_on")==null?null:asLocalDate(s.get("ends_on"));if(!next.isAfter(asLocalDate(s.get("next_due_on"))))return one("SELECT * FROM crm_maintenance_visits WHERE id=:id",Map.of("id",id));if(end==null||!next.isAfter(end))db.update("UPDATE crm_maintenance_schedules SET next_due_on=:next,updated_at=CURRENT_TIMESTAMP WHERE id=:id",Map.of("id",s.get("id"),"next",next));else db.update("UPDATE crm_maintenance_schedules SET status='COMPLETED',updated_at=CURRENT_TIMESTAMP WHERE id=:id",Map.of("id",s.get("id")));}return one("SELECT * FROM crm_maintenance_visits WHERE id=:id",Map.of("id",id));}
    @Transactional public Map<String,Object> changeScheduleStatus(UUID id,ScheduleStatus r){Map<String,Object>s=one("SELECT * FROM crm_maintenance_schedules WHERE id=:id FOR UPDATE",Map.of("id",id));String from=(String)s.get("status"),to=r.status().toUpperCase(Locale.ROOT);Map<String,Set<String>> transitions=Map.of("ACTIVE",Set.of("PAUSED","COMPLETED","CANCELLED"),"PAUSED",Set.of("ACTIVE","CANCELLED"),"COMPLETED",Set.of(),"CANCELLED",Set.of());if(!transitions.containsKey(to))throw new IllegalArgumentException("Unknown maintenance schedule status");if(!from.equals(to)&&!transitions.get(from).contains(to))throw new IllegalArgumentException("Maintenance schedule status transition is not allowed");if(!from.equals(to))db.update("UPDATE crm_maintenance_schedules SET status=:status,updated_at=CURRENT_TIMESTAMP WHERE id=:id",Map.of("id",id,"status",to));return schedule(id);}

    @Transactional(readOnly=true) public Map<String,Object> schedule(UUID id){return one("SELECT * FROM crm_maintenance_schedules WHERE id=:id",Map.of("id",id));}
    @Transactional(readOnly=true) public Map<String,Object> fulfilment(UUID id){return one("SELECT * FROM crm_fulfilments WHERE id=:id",Map.of("id",id));}
    private MapSqlParameterSource pageParams(int page,int size){int p=Math.max(0,page),s=Math.max(1,Math.min(size,100));return new MapSqlParameterSource().addValue("limit",s).addValue("offset",(long)p*s);}
    private Map<String,Object> one(String sql,Map<String,?> p){try{return db.queryForMap(sql,p);}catch(EmptyResultDataAccessException e){throw notFound("CRM record");}}
    private Map<String,Object> one(String sql,SqlParameterSource p){try{return db.queryForMap(sql,p);}catch(EmptyResultDataAccessException e){throw notFound("CRM record");}}
    private boolean exists(String sql,Map<String,?> p){return Boolean.TRUE.equals(db.queryForObject(sql,p,Boolean.class));}
    private static void validateDates(LocalDate start,LocalDate end){if(start!=null&&end!=null&&end.isBefore(start))throw new IllegalArgumentException("endsOn must be on or after startsOn");}
    private static void validateEnum(String value,Set<String> allowed,String name){if(value==null||!allowed.contains(value.toUpperCase(Locale.ROOT)))throw new IllegalArgumentException("Unknown "+name);}
    private static LocalDate asLocalDate(Object value){if(value instanceof LocalDate d)return d;if(value instanceof java.sql.Date d)return d.toLocalDate();if(value instanceof java.sql.Timestamp t)return t.toLocalDateTime().toLocalDate();throw new IllegalArgumentException("Database returned an invalid date value");}
    private static OffsetDateTime asOffsetDateTime(Object value){if(value==null)return null;if(value instanceof OffsetDateTime d)return d;if(value instanceof java.sql.Timestamp t)return t.toInstant().atOffset(ZoneOffset.UTC);if(value instanceof java.time.Instant i)return i.atOffset(ZoneOffset.UTC);throw new IllegalArgumentException("Database returned an invalid timestamp value");}
    private static EntityNotFoundException notFound(String value){return new EntityNotFoundException(value+" not found");}
}
