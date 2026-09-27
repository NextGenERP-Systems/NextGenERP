package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.DowntimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DowntimeEntryRepository extends JpaRepository<DowntimeEntry, String> {

    List<DowntimeEntry> findByWorkstationId(String workstationId);
}
