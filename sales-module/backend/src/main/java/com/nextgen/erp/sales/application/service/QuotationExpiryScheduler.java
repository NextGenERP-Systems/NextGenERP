package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.domain.model.Quotation;
import com.nextgen.erp.sales.domain.model.QuotationStatus;
import com.nextgen.erp.sales.infrastructure.repository.QuotationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class QuotationExpiryScheduler {

    private final QuotationRepository quotationRepository;

    @Scheduled(cron = "0 0 1 * * ?") // Run every day at 1:00 AM
    @Transactional
    public void markExpiredQuotations() {
        LocalDate today = LocalDate.now();
        List<Quotation> openQuotes = quotationRepository.findAll();

        int expiredCount = 0;
        for (Quotation q : openQuotes) {
            if ((q.getStatus() == QuotationStatus.OPEN || q.getStatus() == QuotationStatus.REPLIED)
                    && q.getValidTill() != null && q.getValidTill().isBefore(today)) {
                q.setStatus(QuotationStatus.EXPIRED);
                quotationRepository.save(q);
                expiredCount++;
            }
        }

        if (expiredCount > 0) {
            log.info("QuotationExpiryScheduler: Automatically marked {} expired quotations as EXPIRED.", expiredCount);
        }
    }
}
