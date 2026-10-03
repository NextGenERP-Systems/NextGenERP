package com.nextgen.erp.crm.service;

import com.nextgen.erp.crm.service.phase5.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service @RequiredArgsConstructor
public class CrmMessageWorkerService {
    private final NamedParameterJdbcTemplate db;
    private final EmailProvider email;
    private final SmsProvider sms;

    @Transactional
    public Map<String,Object> claim(){
        db.update("UPDATE crm_message_delivery_attempts a SET result='UNKNOWN',error_code='LEASE_EXPIRED',error_detail='Worker stopped before reporting the provider outcome',completed_at=CURRENT_TIMESTAMP FROM crm_messages m WHERE a.message_id=m.id AND a.attempt_number=m.attempt_count AND a.completed_at IS NULL AND m.status='PROCESSING' AND m.lease_until<CURRENT_TIMESTAMP",Map.of());
        db.update("UPDATE crm_messages SET status='UNKNOWN',last_error='Delivery outcome is uncertain after worker lease expired',lease_until=NULL,updated_at=CURRENT_TIMESTAMP WHERE status='PROCESSING' AND lease_until<CURRENT_TIMESTAMP",Map.of());
        List<Map<String,Object>> rows=db.queryForList("SELECT m.* FROM crm_messages m WHERE m.status='QUEUED' AND m.scheduled_at<=CURRENT_TIMESTAMP AND (m.next_attempt_at IS NULL OR m.next_attempt_at<=CURRENT_TIMESTAMP) ORDER BY m.scheduled_at,m.id FOR UPDATE SKIP LOCKED LIMIT 1",Map.of());
        if(rows.isEmpty())return null;
        Map<String,Object> m=rows.get(0);UUID id=(UUID)m.get("id");
        String channel=m.get("channel").toString();
        String destination=(String)m.get("destination");UUID contact=(UUID)m.get("contact_id");Object campaign=m.get("campaign_id");
        String field=channel.equals("EMAIL")?"email":"phone";
        String current=db.queryForObject("SELECT "+field+" FROM crm_contacts WHERE id=:id",Map.of("id",contact),String.class);
        String consent="";
        if(current!=null){try{consent=db.queryForObject("SELECT consent_state FROM crm_communication_preferences WHERE contact_id=:id AND channel=:channel AND destination=:destination",Map.of("id",contact,"channel",channel,"destination",destination),String.class);}catch(org.springframework.dao.EmptyResultDataAccessException ignored){}}
        boolean eligible=current!=null&&current.trim().equalsIgnoreCase(destination)&&"OPTED_IN".equals(consent);
        if(campaign!=null){
            String status=db.queryForObject("SELECT status FROM crm_campaigns WHERE id=:id",Map.of("id",campaign),String.class);
            Integer members=db.queryForObject("SELECT count(*) FROM crm_campaign_members WHERE campaign_id=:campaign AND contact_id=:contact AND status<>'REMOVED'",Map.of("campaign",campaign,"contact",contact),Integer.class);
            eligible=eligible&&"ACTIVE".equals(status)&&members!=null&&members>0;
        }
        if(!eligible){db.update("UPDATE crm_messages SET status='CANCELLED',last_error='Recipient eligibility changed before dispatch',updated_at=CURRENT_TIMESTAMP WHERE id=:id",Map.of("id",id));return Map.of("cancelled",true);}
        int number=((Number)m.get("attempt_count")).intValue()+1;
        db.update("UPDATE crm_messages SET status='PROCESSING',lease_until=CURRENT_TIMESTAMP+INTERVAL '2 minutes',attempt_count=:n,updated_at=CURRENT_TIMESTAMP WHERE id=:id",Map.of("id",id,"n",number));
        db.update("INSERT INTO crm_message_delivery_attempts(message_id,attempt_number,result) VALUES(:id,:n,'UNKNOWN')",Map.of("id",id,"n",number));
        m.put("attempt_number",number);return m;
    }

    public void deliver(Map<String,Object> message){
        if(message==null||Boolean.TRUE.equals(message.get("cancelled")))return;
        String channel=message.get("channel").toString();
        CommunicationProvider provider=channel.equals("EMAIL")?email:sms;
        CommunicationProvider.Result result;
        try{result=provider.deliver((String)message.get("destination"),(String)message.get("subject_snapshot"),(String)message.get("body_snapshot"),(String)message.get("idempotency_key"));}
        catch(Exception e){result=new CommunicationProvider.Result(CommunicationProvider.Outcome.UNKNOWN,null,"PROVIDER_OUTCOME_UNKNOWN","Provider outcome is uncertain; automatic retry is blocked.");}
        finish(message,result);
    }

    @Transactional
    public void finish(Map<String,Object> message,CommunicationProvider.Result result){
        UUID id=(UUID)message.get("id");int attempt=(Integer)message.get("attempt_number");
        String state=result.outcome().name();
        db.update("UPDATE crm_message_delivery_attempts SET result=:state,provider_message_id=:provider,error_code=:code,error_detail=:detail,completed_at=CURRENT_TIMESTAMP WHERE message_id=:id AND attempt_number=:attempt",
                new MapSqlParameterSource().addValue("state",state).addValue("provider",result.providerMessageId()).addValue("code",result.code()).addValue("detail",result.detail()).addValue("id",id).addValue("attempt",attempt));
        boolean retry= result.outcome()==CommunicationProvider.Outcome.RETRYABLE && attempt<5;
        String messageState=retry?"QUEUED":(result.outcome()==CommunicationProvider.Outcome.RETRYABLE?"FAILED":state);
        long delay=Math.min(3600,15L << Math.min(attempt-1,8));
        db.update("UPDATE crm_messages SET status=:state,provider_message_id=:provider,last_error=:detail,lease_until=NULL,next_attempt_at=CASE WHEN :retry THEN CURRENT_TIMESTAMP + (:delay * INTERVAL '1 second') ELSE NULL END,updated_at=CURRENT_TIMESTAMP WHERE id=:id AND status='PROCESSING'",
                new MapSqlParameterSource().addValue("state",messageState).addValue("provider",result.providerMessageId()).addValue("detail",result.detail()).addValue("id",id).addValue("retry",retry).addValue("delay",delay));
    }
}
