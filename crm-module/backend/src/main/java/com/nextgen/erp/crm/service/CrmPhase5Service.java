package com.nextgen.erp.crm.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextgen.erp.crm.dto.phase5.Phase5Requests.*;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.namedparam.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.regex.*;

@Service @RequiredArgsConstructor
public class CrmPhase5Service {
    private final NamedParameterJdbcTemplate db;
    private final ObjectMapper json;

    @Transactional
    public Map<String,Object> createCampaign(Campaign r) {
        validateDates(r.startsAt(), r.endsAt()); validateBudget(r.budget(),r.currency());
        return one("""
            INSERT INTO crm_campaigns(name,description,channel,starts_at,ends_at,owner_id,budget,currency)
            VALUES(:name,:description,:channel,:starts,:ends,:owner,:budget,:currency) RETURNING *
            """, campaignParams(r));
    }
    @Transactional(readOnly=true)
    public Map<String,Object> campaign(UUID id) { return one("SELECT * FROM crm_campaigns WHERE id=:id", Map.of("id",id)); }
    @Transactional(readOnly=true)
    public List<Map<String,Object>> campaigns(int page,int size,String status) {
        page=boundPage(page); size=boundSize(size); MapSqlParameterSource p=new MapSqlParameterSource().addValue("limit",size).addValue("offset",(long)page*size).addValue("status",status);
        return db.queryForList("SELECT * FROM crm_campaigns WHERE (CAST(:status AS text) IS NULL OR status=:status) ORDER BY created_at DESC,id DESC LIMIT :limit OFFSET :offset",p);
    }
    @Transactional
    public Map<String,Object> updateCampaign(UUID id,VersionedCampaign r) {
        validateDates(r.startsAt(),r.endsAt()); validateBudget(r.budget(),r.currency());
        MapSqlParameterSource p=campaignParams(r).addValue("id",id).addValue("version",r.version());
        int n=db.update("""
            UPDATE crm_campaigns SET name=:name,description=:description,channel=:channel,status=:status,
            starts_at=:starts,ends_at=:ends,owner_id=:owner,budget=:budget,currency=:currency,updated_at=CURRENT_TIMESTAMP,version=version+1
            WHERE id=:id AND version=:version""",p);
        if(n==0){ if(!exists("SELECT EXISTS(SELECT 1 FROM crm_campaigns WHERE id=:id)",Map.of("id",id)))throw notFound("Campaign"); throw new CrmConflictException("Campaign version is stale"); }
        return campaign(id);
    }
    @Transactional
    public Map<String,Object> changeCampaignStatus(UUID id,String next) {
        CampaignStatus to; try{to=CampaignStatus.valueOf(next);}catch(Exception e){throw new IllegalArgumentException("Unknown campaign status");}
        Map<String,Object> current=campaign(id); CampaignStatus from=CampaignStatus.valueOf((String)current.get("status"));
        Map<CampaignStatus,Set<CampaignStatus>> allowed=Map.of(
                CampaignStatus.DRAFT,Set.of(CampaignStatus.SCHEDULED,CampaignStatus.ACTIVE,CampaignStatus.ARCHIVED),
                CampaignStatus.SCHEDULED,Set.of(CampaignStatus.ACTIVE,CampaignStatus.PAUSED,CampaignStatus.ARCHIVED),
                CampaignStatus.ACTIVE,Set.of(CampaignStatus.PAUSED,CampaignStatus.COMPLETED,CampaignStatus.ARCHIVED),
                CampaignStatus.PAUSED,Set.of(CampaignStatus.ACTIVE,CampaignStatus.COMPLETED,CampaignStatus.ARCHIVED),
                CampaignStatus.COMPLETED,Set.of(CampaignStatus.ARCHIVED), CampaignStatus.ARCHIVED,Set.of());
        if(from!=to&&!allowed.get(from).contains(to))throw new IllegalArgumentException("Campaign status transition is not allowed");
        db.update("UPDATE crm_campaigns SET status=:status,updated_at=CURRENT_TIMESTAMP,version=version+1 WHERE id=:id",Map.of("status",to.name(),"id",id)); return campaign(id);
    }
    @Transactional public void deleteCampaign(UUID id) { requireCampaign(id); db.update("DELETE FROM crm_campaigns WHERE id=:id",Map.of("id",id)); }

    @Transactional public Map<String,Object> addCost(UUID campaignId,Cost r) {
        requireCampaign(campaignId);
        return one("INSERT INTO crm_campaign_costs(campaign_id,amount,currency,cost_date,description) VALUES(:campaign,:amount,:currency,:date,:description) RETURNING *",
                new MapSqlParameterSource().addValue("campaign",campaignId).addValue("amount",r.amount()).addValue("currency",r.currency()).addValue("date",r.costDate()).addValue("description",r.description()));
    }
    @Transactional(readOnly=true) public List<Map<String,Object>> costs(UUID id){requireCampaign(id);return db.queryForList("SELECT * FROM crm_campaign_costs WHERE campaign_id=:id ORDER BY cost_date DESC,id DESC",Map.of("id",id));}

    @Transactional public Map<String,Object> addMember(UUID campaignId,Member r) {
        Map<String,Object> campaign=requireCampaign(campaignId);
        if(!Set.of("ACTIVE","SCHEDULED","DRAFT","PAUSED").contains(campaign.get("status")))throw new IllegalArgumentException("Campaign cannot accept members in its current status");
        if(!exists("SELECT EXISTS(SELECT 1 FROM crm_contacts WHERE id=:id)",Map.of("id",r.contactId())))throw notFound("CRM contact");
        Map<String,Object> member=one("INSERT INTO crm_campaign_members(campaign_id,contact_id) VALUES(:campaign,:contact) RETURNING *",Map.of("campaign",campaignId,"contact",r.contactId()));
        db.update("INSERT INTO crm_campaign_member_events(member_id,to_status) VALUES(:id,'ADDED')",Map.of("id",member.get("id")));
        return member;
    }
    @Transactional(readOnly=true) public List<Map<String,Object>> members(UUID id,int page,int size){requireCampaign(id);int bounded=boundSize(size);return db.queryForList("SELECT m.*,c.first_name,c.last_name,c.email,c.phone FROM crm_campaign_members m JOIN crm_contacts c ON c.id=m.contact_id WHERE m.campaign_id=:id ORDER BY m.added_at DESC,m.id DESC LIMIT :limit OFFSET :offset",new MapSqlParameterSource().addValue("id",id).addValue("limit",bounded).addValue("offset",(long)boundPage(page)*bounded));}
    @Transactional(readOnly=true) public List<Map<String,Object>> memberEvents(UUID id,UUID memberId){requireCampaign(id);if(!exists("SELECT EXISTS(SELECT 1 FROM crm_campaign_members WHERE campaign_id=:campaign AND id=:id)",Map.of("campaign",id,"id",memberId)))throw notFound("Campaign member");return db.queryForList("SELECT * FROM crm_campaign_member_events WHERE member_id=:id ORDER BY changed_at DESC,id DESC LIMIT 100",Map.of("id",memberId));}
    @Transactional public Map<String,Object> memberStatus(UUID id,UUID memberId,String status) {
        if(!Set.of("ADDED","CONTACTED","RESPONDED","REMOVED").contains(status))throw new IllegalArgumentException("Unknown campaign member status");
        Map<String,Object> old=one("SELECT * FROM crm_campaign_members WHERE campaign_id=:campaign AND id=:id FOR UPDATE",Map.of("campaign",id,"id",memberId));
        String prior=(String)old.get("status");Map<String,Set<String>> transitions=Map.of("ADDED",Set.of("CONTACTED","REMOVED"),"CONTACTED",Set.of("RESPONDED","REMOVED"),"RESPONDED",Set.of("REMOVED"),"REMOVED",Set.of("ADDED"));
        if(!prior.equals(status)&&!transitions.get(prior).contains(status))throw new IllegalArgumentException("Campaign member status transition is not allowed");
        if(prior.equals(status))return old;
        db.update("UPDATE crm_campaign_members SET status=:status,updated_at=CURRENT_TIMESTAMP WHERE campaign_id=:campaign AND id=:id",Map.of("status",status,"campaign",id,"id",memberId));
        db.update("INSERT INTO crm_campaign_member_events(member_id,from_status,to_status) VALUES(:id,:from,:to)",Map.of("id",memberId,"from",prior,"to",status));
        return one("SELECT * FROM crm_campaign_members WHERE id=:id",Map.of("id",memberId));
    }

    @Transactional public Map<String,Object> addTouchpoint(Touchpoint r) {
        if(r.campaignId()!=null)requireCampaign(r.campaignId());
        String col=targetColumn(r.targetType()); if(!exists("SELECT EXISTS(SELECT 1 FROM crm_"+targetTable(r.targetType())+" WHERE id=:id)",Map.of("id",r.targetId())))throw notFound("CRM target");
        MapSqlParameterSource p=new MapSqlParameterSource().addValue("campaign",r.campaignId()).addValue("target",r.targetId()).addValue("event",r.eventType()).addValue("key",r.eventKey())
                .addValue("source",r.source()).addValue("medium",r.medium()).addValue("us",r.utmSource()).addValue("um",r.utmMedium()).addValue("uc",r.utmCampaign()).addValue("ucon",r.utmContent()).addValue("ut",r.utmTerm()).addValue("occurred",r.occurredAt()==null?OffsetDateTime.now():r.occurredAt());
        String sql="INSERT INTO crm_campaign_touchpoints(campaign_id,"+col+",event_type,event_key,source,medium,utm_source,utm_medium,utm_campaign,utm_content,utm_term,occurred_at) VALUES(:campaign,:target,:event,:key,:source,:medium,:us,:um,:uc,:ucon,:ut,:occurred) ON CONFLICT(event_key) DO NOTHING RETURNING *";
        List<Map<String,Object>> rows=db.queryForList(sql,p);
        if(!rows.isEmpty())return rows.get(0);
        Map<String,Object> old=one("SELECT * FROM crm_campaign_touchpoints WHERE event_key=:key",Map.of("key",r.eventKey()));
        if(!Objects.equals(old.get(col),r.targetId())||!Objects.equals(old.get("event_type"),r.eventType())||!Objects.equals(old.get("campaign_id"),r.campaignId()))throw new CrmConflictException("Event key was already used with a different touchpoint");
        return old;
    }
    @Transactional(readOnly=true) public List<Map<String,Object>> touchpoints(TargetType type,UUID id){String col=targetColumn(type);return db.queryForList("SELECT * FROM crm_campaign_touchpoints WHERE "+col+"=:id ORDER BY occurred_at DESC,id DESC LIMIT 100",Map.of("id",id));}
    @Transactional(readOnly=true) public List<Map<String,Object>> campaignTouchpoints(UUID id){requireCampaign(id);return db.queryForList("SELECT * FROM crm_campaign_touchpoints WHERE campaign_id=:id ORDER BY occurred_at DESC,id DESC LIMIT 100",Map.of("id",id));}
    @Transactional public Map<String,Object> linkAttribution(UUID touchpointId,TargetType type,UUID targetId,String linkType) {
        if(!Set.of("QUALIFICATION","OPPORTUNITY_ASSOCIATION").contains(linkType))throw new IllegalArgumentException("Unknown attribution link type");
        String col=targetColumn(type);String table=targetTable(type);
        Map<String,Object> tp=one("SELECT * FROM crm_campaign_touchpoints WHERE id=:id",Map.of("id",touchpointId));
        if(!Objects.equals(tp.get(col),targetId))throw new IllegalArgumentException("Touchpoint target must match attribution target");
        if(!exists("SELECT EXISTS(SELECT 1 FROM crm_"+table+" WHERE id=:id)",Map.of("id",targetId)))throw notFound("CRM target");
        List<Map<String,Object>> rows=db.queryForList("INSERT INTO crm_campaign_attribution_links(touchpoint_id,"+col+",link_type) VALUES(:touchpoint,:target,:type) ON CONFLICT DO NOTHING RETURNING *",Map.of("touchpoint",touchpointId,"target",targetId,"type",linkType));
        if(!rows.isEmpty())return rows.get(0);
        return one("SELECT * FROM crm_campaign_attribution_links WHERE touchpoint_id=:touchpoint AND "+col+"=:target AND link_type=:type",Map.of("touchpoint",touchpointId,"target",targetId,"type",linkType));
    }
    @Transactional public void recordQualificationAttribution(UUID touchpointId,UUID leadId,UUID prospectId){
        Map<String,Object> tp=one("SELECT * FROM crm_campaign_touchpoints WHERE id=:id",Map.of("id",touchpointId));
        if(!Objects.equals(tp.get("lead_id"),leadId))throw new IllegalArgumentException("Qualification touchpoint must belong to the lead");
        List<Map<String,Object>> inserted=db.queryForList("INSERT INTO crm_campaign_attribution_links(touchpoint_id,prospect_id,link_type) VALUES(:touchpoint,:prospect,'QUALIFICATION') ON CONFLICT DO NOTHING RETURNING *",Map.of("touchpoint",touchpointId,"prospect",prospectId));
        if(!inserted.isEmpty())return;
        Map<String,Object> old=one("SELECT * FROM crm_campaign_attribution_links WHERE prospect_id=:prospect AND link_type='QUALIFICATION'",Map.of("prospect",prospectId));
        if(!Objects.equals(old.get("touchpoint_id"),touchpointId))throw new CrmConflictException("Qualification already has a different attributed touchpoint");
    }
    @Transactional public void recordOpportunityAttribution(UUID touchpointId,UUID opportunityId){
        boolean related=exists("""
            SELECT EXISTS(SELECT 1 FROM crm_campaign_touchpoints t JOIN crm_opportunities o ON o.id=:opportunity
            LEFT JOIN crm_lead_prospect_links l ON l.lead_id=t.lead_id
            WHERE t.id=:touchpoint AND (t.opportunity_id=o.id OR (o.prospect_id IS NOT NULL AND (t.prospect_id=o.prospect_id OR l.prospect_id=o.prospect_id))))""",Map.of("touchpoint",touchpointId,"opportunity",opportunityId));
        if(!related)throw new IllegalArgumentException("Attribution touchpoint must belong to the opportunity or its prospect lineage");
        List<Map<String,Object>> inserted=db.queryForList("INSERT INTO crm_campaign_attribution_links(touchpoint_id,opportunity_id,link_type) VALUES(:touchpoint,:opportunity,'OPPORTUNITY_ASSOCIATION') ON CONFLICT DO NOTHING RETURNING *",Map.of("touchpoint",touchpointId,"opportunity",opportunityId));
        if(!inserted.isEmpty())return;
        Map<String,Object> old=one("SELECT * FROM crm_campaign_attribution_links WHERE opportunity_id=:id AND link_type='OPPORTUNITY_ASSOCIATION'",Map.of("id",opportunityId));
        if(!Objects.equals(old.get("touchpoint_id"),touchpointId))throw new CrmConflictException("Opportunity already has a different attributed touchpoint");
    }
    @Transactional(readOnly=true) public List<Map<String,Object>> attribution(TargetType type,UUID id){String col=targetColumn(type);return db.queryForList("SELECT a.*,t.campaign_id,t.event_type,t.source,t.medium,t.utm_source,t.utm_medium,t.utm_campaign,t.utm_content,t.utm_term,t.occurred_at FROM crm_campaign_attribution_links a JOIN crm_campaign_touchpoints t ON t.id=a.touchpoint_id WHERE a."+col+"=:id ORDER BY a.linked_at DESC,a.id DESC LIMIT 100",Map.of("id",id));}

    private MapSqlParameterSource campaignParams(Campaign r){return new MapSqlParameterSource().addValue("name",r.name().trim()).addValue("description",r.description()).addValue("channel",r.channel().name()).addValue("starts",r.startsAt()).addValue("ends",r.endsAt()).addValue("owner",r.ownerId()).addValue("budget",r.budget()).addValue("currency",r.currency());}
    private MapSqlParameterSource campaignParams(VersionedCampaign r){return campaignParams(new Campaign(r.name(),r.description(),r.channel(),r.startsAt(),r.endsAt(),r.ownerId(),r.budget(),r.currency())).addValue("status",r.status().name());}
    private static void validateDates(OffsetDateTime a,OffsetDateTime b){if(a!=null&&b!=null&&!b.isAfter(a))throw new IllegalArgumentException("endsAt must be after startsAt");}
    private static void validateBudget(java.math.BigDecimal b,String c){if((b==null)!=(c==null))throw new IllegalArgumentException("Budget and currency must be supplied together");if(c!=null&&!c.matches("[A-Z]{3}"))throw new IllegalArgumentException("currency must be an uppercase ISO code");}
    private Map<String,Object> requireCampaign(UUID id){return campaign(id);}
    private Map<String,Object> one(String sql,Map<String,?> p){try{return db.queryForMap(sql,p);}catch(EmptyResultDataAccessException e){throw notFound("CRM record");}}
    private Map<String,Object> one(String sql,org.springframework.jdbc.core.namedparam.SqlParameterSource p){try{return db.queryForMap(sql,p);}catch(EmptyResultDataAccessException e){throw notFound("CRM record");}}
    private boolean exists(String sql,Map<String,?> p){return Boolean.TRUE.equals(db.queryForObject(sql,p,Boolean.class));}
    private static jakarta.persistence.EntityNotFoundException notFound(String what){return new jakarta.persistence.EntityNotFoundException(what+" not found");}
    private static int boundPage(int p){return Math.max(0,p);}
    private static int boundSize(int s){return Math.max(1,Math.min(s,100));}
    private static String targetColumn(TargetType t){return switch(t){case LEAD->"lead_id";case PROSPECT->"prospect_id";case OPPORTUNITY->"opportunity_id";};}
    private static String targetTable(TargetType t){return switch(t){case LEAD->"leads";case PROSPECT->"prospects";case OPPORTUNITY->"opportunities";};}
}
