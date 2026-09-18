package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.ScrapItem;
import com.nextgen.erp.mrp.domain.repository.ScrapItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScrapService {

    private final ScrapItemRepository scrapItemRepository;

    @Transactional(readOnly = true)
    public List<ScrapItem> getAllScrapItems() {
        return scrapItemRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<ScrapItem> getScrapByWorkOrder(String workOrderId) {
        return scrapItemRepository.findByWorkOrderId(workOrderId);
    }

    @Transactional
    public ScrapItem logScrapItem(ScrapItem scrapItem) {
        if (scrapItem.getCreatedAt() == null) {
            scrapItem.setCreatedAt(ZonedDateTime.now());
        }
        return scrapItemRepository.save(scrapItem);
    }
}
