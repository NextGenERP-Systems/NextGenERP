package com.nextgen.erp.projects.infrastructure.repository;

import com.nextgen.erp.projects.domain.model.Timesheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TimesheetRepository extends JpaRepository<Timesheet, UUID> {
    List<Timesheet> findByProject_Id(UUID projectId);
    List<Timesheet> findByUserId(UUID userId);
}
