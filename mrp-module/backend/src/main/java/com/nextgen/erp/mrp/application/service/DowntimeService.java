package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.DowntimeEntry;
import com.nextgen.erp.mrp.domain.repository.DowntimeEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DowntimeService {

    private final DowntimeEntryRepository downtimeEntryRepository;

    @Transactional(readOnly = true)
    public List<DowntimeEntry> getAllDowntimeEntries() {
        return downtimeEntryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<DowntimeEntry> getDowntimeByWorkstation(String workstationId) {
        return downtimeEntryRepository.findByWorkstationId(workstationId);
    }

    @Transactional
    public DowntimeEntry logDowntime(DowntimeEntry entry) {
        if (entry.getCreatedAt() == null) {
            entry.setCreatedAt(ZonedDateTime.now());
        }
        if (entry.getStartTime() != null && entry.getEndTime() != null && entry.getDowntimeInMins() == null) {
            long mins = Duration.between(entry.getStartTime(), entry.getEndTime()).toMinutes();
            entry.setDowntimeInMins(BigDecimal.valueOf(mins));
        }
        return downtimeEntryRepository.save(entry);
    }
}
