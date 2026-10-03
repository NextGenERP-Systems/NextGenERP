package com.nextgen.erp.crm.service.phase5;

public interface CommunicationProvider {
    Result deliver(String destination,String subject,String body,String idempotencyKey);
    record Result(Outcome outcome,String providerMessageId,String code,String detail){}
    enum Outcome { SUBMITTED, RETRYABLE, FAILED, UNKNOWN }
}
