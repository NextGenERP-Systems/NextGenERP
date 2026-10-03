package com.nextgen.erp.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.namedparam.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Service @RequiredArgsConstructor
public class CrmProviderEventService {
    private final NamedParameterJdbcTemplate db;
    @Value("${crm.communication.callback-secret:}") private String secret;

    @Transactional public Map<String,Object> accept(String provider,String signature,Event request){
        if(secret==null||secret.isBlank())throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Provider callbacks are not configured");
        if(provider==null||!provider.matches("[A-Za-z0-9_-]{1,80}"))throw new IllegalArgumentException("Invalid provider name");
        String type=request.eventType().toUpperCase(Locale.ROOT);
        if(!Set.of("SUBMITTED","DELIVERED","FAILED").contains(type))throw new IllegalArgumentException("Unsupported provider event type");
        String canonical=provider+":"+request.eventId()+":"+request.messageId()+":"+type;
        if(!validSignature(signature,canonical))throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Provider signature is invalid");
        Map<String,Object> message;
        try{message=db.queryForMap("SELECT id,status FROM crm_messages WHERE id=:id FOR UPDATE",Map.of("id",request.messageId()));}
        catch(org.springframework.dao.EmptyResultDataAccessException ex){throw new jakarta.persistence.EntityNotFoundException("CRM message not found");}
        List<Map<String,Object>> inserted=db.queryForList("INSERT INTO crm_provider_events(provider,provider_event_id,message_id,event_type,verified) VALUES(:provider,:event,:message,:type,TRUE) ON CONFLICT(provider,provider_event_id) DO NOTHING RETURNING *",Map.of("provider",provider,"event",request.eventId(),"message",request.messageId(),"type",type));
        if(inserted.isEmpty()){
            Map<String,Object> old=db.queryForMap("SELECT * FROM crm_provider_events WHERE provider=:provider AND provider_event_id=:event",Map.of("provider",provider,"event",request.eventId()));
            if(!Objects.equals(old.get("message_id"),request.messageId())||!Objects.equals(old.get("event_type"),type))throw new CrmConflictException("Provider event ID was reused with a different event");
            return old;
        }
        String status=(String)message.get("status");
        if(Set.of("SUBMITTED","UNKNOWN","PROCESSING").contains(status)){
            db.update("UPDATE crm_messages SET status=:status,updated_at=CURRENT_TIMESTAMP,lease_until=NULL WHERE id=:id",Map.of("status",type,"id",request.messageId()));
            db.update("UPDATE crm_message_delivery_attempts SET result=:result,completed_at=COALESCE(completed_at,CURRENT_TIMESTAMP) WHERE id=(SELECT id FROM crm_message_delivery_attempts WHERE message_id=:id ORDER BY attempt_number DESC LIMIT 1)",Map.of("result",type,"id",request.messageId()));
        }else if(!status.equals(type))throw new CrmConflictException("Provider event conflicts with the terminal message state");
        return inserted.get(0);
    }
    private boolean validSignature(String provided,String value){
        if(provided==null||!provided.matches("[0-9a-fA-F]{64}"))return false;
        try{Mac mac=Mac.getInstance("HmacSHA256");mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8),"HmacSHA256"));byte[] actual=mac.doFinal(value.getBytes(StandardCharsets.UTF_8));byte[] expected=HexFormat.of().parseHex(provided);return MessageDigest.isEqual(actual,expected);}catch(Exception e){throw new IllegalStateException("Unable to verify provider signature",e);}
    }
    public record Event(String eventId,UUID messageId,String eventType){
        public Event{if(eventId==null||eventId.isBlank()||eventId.length()>200||messageId==null||eventType==null)throw new IllegalArgumentException("Provider event fields are required");}
    }
}
