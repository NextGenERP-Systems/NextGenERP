package com.nextgen.erp.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component @RequiredArgsConstructor
@ConditionalOnProperty(name="crm.communication.worker.enabled",havingValue="true")
public class CrmMessageWorker {
    private final CrmMessageWorkerService service;
    @Scheduled(fixedDelayString="${crm.communication.worker.poll-ms:5000}")
    public void poll(){service.deliver(service.claim());}
}
