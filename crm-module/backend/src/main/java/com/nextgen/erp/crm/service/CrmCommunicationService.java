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
import java.util.*;
import java.util.regex.*;

@Service @RequiredArgsConstructor
public class CrmCommunicationService {
    private static final Pattern VARIABLE=Pattern.compile("\\{\\{([A-Za-z][A-Za-z0-9_.-]{0,99})}}");
    private final NamedParameterJdbcTemplate db;
    private final ObjectMapper json;

    @Transactional public Map<String,Object> createTemplate(Template r){
        validateTemplate(r); List<String> variables=variables(r.subject()+"\n"+r.body());
        MapSqlParameterSource p=templateParams(r,variables).addValue("revision",1);
        return one("INSERT INTO crm_message_templates(name,channel,revision,subject,body,variables,active) VALUES(:name,:channel,:revision,:subject,:body,CAST(:variables AS jsonb),:active) RETURNING *",p);
    }
    @Transactional public Map<String,Object> reviseTemplate(UUID id,Template r){
        validateTemplate(r);Map<String,Object> old=template(id);
        if(!Objects.equals(old.get("channel").toString(),r.channel().name()))throw new IllegalArgumentException("A template revision cannot change channel");
        int next=(Integer)old.get("revision")+1;
        return one("INSERT INTO crm_message_templates(name,channel,revision,subject,body,variables,active) VALUES(:name,:channel,:revision,:subject,:body,CAST(:variables AS jsonb),:active) RETURNING *",templateParams(r,variables(r.subject()+"\n"+r.body())).addValue("revision",next));
    }
    @Transactional(readOnly=true) public Map<String,Object> template(UUID id){return one("SELECT * FROM crm_message_templates WHERE id=:id",Map.of("id",id));}
    @Transactional(readOnly=true) public List<Map<String,Object>> templates(){return db.queryForList("SELECT * FROM crm_message_templates ORDER BY name,channel,revision DESC",Map.of());}
    @Transactional public Map<String,Object> active(UUID id,boolean active){db.update("UPDATE crm_message_templates SET active=:active,updated_at=CURRENT_TIMESTAMP WHERE id=:id",Map.of("active",active,"id",id));return template(id);}

    @Transactional public Map<String,Object> preference(UUID contactId,Channel channel,Preference r){
        if(channel!=Channel.EMAIL&&channel!=Channel.SMS)throw new IllegalArgumentException("Communication preference channel must be EMAIL or SMS");
        Map<String,Object> contact=one("SELECT id,email,phone FROM crm_contacts WHERE id=:id",Map.of("id",contactId));
        String destination=destination(contact,channel);
        if(destination==null||destination.isBlank())throw new IllegalArgumentException("Contact has no destination for this channel");
        validateDestination(channel,destination);
        MapSqlParameterSource p=new MapSqlParameterSource().addValue("contact",contactId).addValue("channel",channel.name()).addValue("destination",destination).addValue("state",r.consentState().name()).addValue("source",r.source());
        db.update("""
            INSERT INTO crm_communication_preferences(contact_id,channel,destination,consent_state,source)
            VALUES(:contact,:channel,:destination,:state,:source)
            ON CONFLICT(contact_id,channel,destination) DO UPDATE SET consent_state=EXCLUDED.consent_state,source=EXCLUDED.source,effective_at=CURRENT_TIMESTAMP""",p);
        Map<String,Object> pref=one("SELECT * FROM crm_communication_preferences WHERE contact_id=:contact AND channel=:channel AND destination=:destination",p);
        db.update("INSERT INTO crm_communication_preference_events(preference_id,consent_state,source) VALUES(:id,:state,:source)",new MapSqlParameterSource().addValue("id",pref.get("id")).addValue("state",r.consentState().name()).addValue("source",r.source()));
        return pref;
    }
    @Transactional(readOnly=true) public List<Map<String,Object>> preferences(UUID contactId){
        if(!exists("SELECT EXISTS(SELECT 1 FROM crm_contacts WHERE id=:id)",Map.of("id",contactId)))throw missing("Contact");
        return db.queryForList("SELECT * FROM crm_communication_preferences WHERE contact_id=:id ORDER BY channel,destination",Map.of("id",contactId));
    }
    @Transactional(readOnly=true) public List<Map<String,Object>> preferenceEvents(UUID contactId,Channel channel){
        if(!exists("SELECT EXISTS(SELECT 1 FROM crm_contacts WHERE id=:id)",Map.of("id",contactId)))throw missing("Contact");
        return db.queryForList("SELECT e.* FROM crm_communication_preference_events e JOIN crm_communication_preferences p ON p.id=e.preference_id WHERE p.contact_id=:id AND p.channel=:channel ORDER BY e.effective_at DESC,e.id DESC LIMIT 100",Map.of("id",contactId,"channel",channel.name()));
    }

    @Transactional public Map<String,Object> enqueue(Enqueue r){
        Map<String,Object> contact=one("SELECT id,email,phone FROM crm_contacts WHERE id=:id",Map.of("id",r.contactId()));
        Map<String,Object> template=template(r.templateId());
        if(!Boolean.TRUE.equals(template.get("active")))throw new IllegalArgumentException("Template is inactive");
        Channel channel=Channel.valueOf(template.get("channel").toString());
        String destination=destination(contact,channel);
        if(destination==null||destination.isBlank())throw new IllegalArgumentException("Contact has no destination for this channel");
        validateDestination(channel,destination);
        String preferenceSql="SELECT consent_state FROM crm_communication_preferences WHERE contact_id=:contact AND channel=:channel AND destination=:destination";
        String consent;try{consent=db.queryForObject(preferenceSql,Map.of("contact",r.contactId(),"channel",channel.name(),"destination",destination),String.class);}catch(EmptyResultDataAccessException e){throw new IllegalArgumentException("Explicit opt-in is required before enqueue");}
        if(!"OPTED_IN".equals(consent))throw new IllegalArgumentException("Recipient is not opted in for this destination");
        if(r.campaignId()!=null){
            Map<String,Object> campaign=one("SELECT status,channel FROM crm_campaigns WHERE id=:id",Map.of("id",r.campaignId()));
            if(!"ACTIVE".equals(campaign.get("status")))throw new IllegalArgumentException("Campaign must be active to enqueue messages");
            String campaignChannel=campaign.get("channel").toString();
            if(!campaignChannel.equals(channel.name()))throw new IllegalArgumentException("Message channel does not match campaign channel");
            String memberStatus;try{memberStatus=db.queryForObject("SELECT status FROM crm_campaign_members WHERE campaign_id=:campaign AND contact_id=:contact",Map.of("campaign",r.campaignId(),"contact",r.contactId()),String.class);}catch(EmptyResultDataAccessException e){throw new IllegalArgumentException("Contact is not an active campaign member");}
            if("REMOVED".equals(memberStatus))throw new IllegalArgumentException("Contact was removed from the campaign");
        }
        Map<String,String> vars=r.variables()==null?Map.of():r.variables();
        Set<String> required=parseVariables(template.get("variables"));
        if(!vars.keySet().containsAll(required))throw new IllegalArgumentException("Missing template variables: "+difference(required,vars.keySet()));
        String body=render((String)template.get("body"),vars);String subject=template.get("subject")==null?null:render((String)template.get("subject"),vars);
        String hash=hash(channel+"\n"+destination+"\n"+subject+"\n"+body+"\n"+r.templateId()+"\n"+template.get("revision"));
        List<Map<String,Object>> existing=db.queryForList("SELECT * FROM crm_messages WHERE idempotency_key=:key",Map.of("key",r.idempotencyKey()));
        if(!existing.isEmpty()){
            Map<String,Object> prior=existing.get(0);
            if(!hash.equals(prior.get("payload_hash")))throw new CrmConflictException("Idempotency key was already used with a different message payload");
            return prior;
        }
        MapSqlParameterSource p=new MapSqlParameterSource().addValue("campaign",r.campaignId()).addValue("contact",r.contactId()).addValue("template",r.templateId()).addValue("revision",template.get("revision")).addValue("channel",channel.name()).addValue("destination",destination).addValue("subject",subject).addValue("body",body).addValue("key",r.idempotencyKey()).addValue("hash",hash).addValue("scheduled",r.scheduledAt());
        try{return one("""
            INSERT INTO crm_messages(campaign_id,contact_id,template_id,template_revision,channel,destination,subject_snapshot,body_snapshot,idempotency_key,payload_hash,scheduled_at)
            VALUES(:campaign,:contact,:template,:revision,:channel,:destination,:subject,:body,:key,:hash,COALESCE(:scheduled,CURRENT_TIMESTAMP)) RETURNING *""",p);}
        catch(org.springframework.dao.DuplicateKeyException ex){Map<String,Object> prior=one("SELECT * FROM crm_messages WHERE idempotency_key=:key",Map.of("key",r.idempotencyKey()));if(!hash.equals(prior.get("payload_hash")))throw new CrmConflictException("Idempotency key was already used with a different message payload");return prior;}
    }
    @Transactional(readOnly=true) public Map<String,Object> message(UUID id){return one("SELECT * FROM crm_messages WHERE id=:id",Map.of("id",id));}
    @Transactional(readOnly=true) public List<Map<String,Object>> messages(UUID contactId,int page,int size){return db.queryForList("SELECT * FROM crm_messages WHERE (CAST(:contact AS uuid) IS NULL OR contact_id=:contact) ORDER BY created_at DESC,id DESC LIMIT :limit OFFSET :offset",new MapSqlParameterSource().addValue("contact",contactId).addValue("limit",Math.max(1,Math.min(size,100))).addValue("offset",(long)Math.max(page,0)*Math.max(1,Math.min(size,100))));}
    @Transactional(readOnly=true) public List<Map<String,Object>> attempts(UUID id){message(id);return db.queryForList("SELECT * FROM crm_message_delivery_attempts WHERE message_id=:id ORDER BY attempt_number DESC",Map.of("id",id));}
    @Transactional public Map<String,Object> cancel(UUID id){int n=db.update("UPDATE crm_messages SET status='CANCELLED',updated_at=CURRENT_TIMESTAMP WHERE id=:id AND status='QUEUED'",Map.of("id",id));if(n==0){Map<String,Object> m=message(id);if(!"CANCELLED".equals(m.get("status")))throw new IllegalArgumentException("Only queued messages can be cancelled");return m;}return message(id);}

    private MapSqlParameterSource templateParams(Template r,List<String> vars){try{return new MapSqlParameterSource().addValue("name",r.name().trim()).addValue("channel",r.channel().name()).addValue("subject",r.subject()).addValue("body",r.body()).addValue("variables",json.writeValueAsString(vars)).addValue("active",r.active()==null||r.active());}catch(Exception e){throw new IllegalStateException(e);}}
    private static void validateTemplate(Template r){if(r.channel()!=Channel.EMAIL&&r.channel()!=Channel.SMS)throw new IllegalArgumentException("Templates support EMAIL or SMS only");if(r.channel()==Channel.EMAIL&&(r.subject()==null||r.subject().isBlank()))throw new IllegalArgumentException("Email templates require a subject");if(r.channel()==Channel.SMS&&r.subject()!=null)throw new IllegalArgumentException("SMS templates do not have a subject");}
    private static List<String> variables(String value){Set<String> v=new LinkedHashSet<>();Matcher m=VARIABLE.matcher(value);while(m.find())v.add(m.group(1));return List.copyOf(v);}
    private Set<String> parseVariables(Object value){try{return new LinkedHashSet<>(json.readValue(value.toString(),new TypeReference<List<String>>(){}));}catch(Exception e){throw new IllegalStateException("Stored template variables are invalid",e);}}
    private static Set<String> difference(Set<String>a,Set<String>b){Set<String>r=new TreeSet<>(a);r.removeAll(b);return r;}
    private static String render(String text,Map<String,String> vars){Matcher m=VARIABLE.matcher(text);StringBuffer b=new StringBuffer();while(m.find()){String v=vars.get(m.group(1));if(v==null)throw new IllegalArgumentException("Missing template variable: "+m.group(1));m.appendReplacement(b,Matcher.quoteReplacement(v));}m.appendTail(b);return b.toString();}
    private static String destination(Map<String,Object> c,Channel ch){Object value=c.get(ch==Channel.EMAIL?"email":"phone");if(value==null)return null;String s=value.toString().trim();return ch==Channel.EMAIL?s.toLowerCase(Locale.ROOT):s;}
    private static void validateDestination(Channel ch,String d){if(ch==Channel.EMAIL&&!d.matches("(?i)^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$"))throw new IllegalArgumentException("Contact email is invalid");if(ch==Channel.SMS&&!d.matches("^\\+[1-9][0-9]{7,14}$"))throw new IllegalArgumentException("SMS phone must use E.164 format");}
    private static String hash(String s){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(s.getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException(e);}}
    private Map<String,Object> one(String sql,Map<String,?> p){try{return db.queryForMap(sql,p);}catch(EmptyResultDataAccessException e){throw missing("CRM record");}}
    private Map<String,Object> one(String sql,org.springframework.jdbc.core.namedparam.SqlParameterSource p){try{return db.queryForMap(sql,p);}catch(EmptyResultDataAccessException e){throw missing("CRM record");}}
    private boolean exists(String sql,Map<String,?> p){return Boolean.TRUE.equals(db.queryForObject(sql,p,Boolean.class));}
    private static jakarta.persistence.EntityNotFoundException missing(String what){return new jakarta.persistence.EntityNotFoundException(what+" not found");}
}
