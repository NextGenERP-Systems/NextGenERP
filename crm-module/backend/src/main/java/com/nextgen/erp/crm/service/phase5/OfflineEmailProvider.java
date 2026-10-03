package com.nextgen.erp.crm.service.phase5;

import org.springframework.stereotype.Component;

@Component
public class OfflineEmailProvider implements EmailProvider {
    @Override public Result deliver(String destination,String subject,String body,String idempotencyKey){
        return new Result(Outcome.FAILED,null,"PROVIDER_NOT_CONFIGURED","Email delivery is disabled; message remains in CRM history.");
    }
}
