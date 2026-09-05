package com.nextgen.erp.workflow.domain.repository;

import com.nextgen.erp.workflow.domain.model.WorkflowSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkflowSettingsRepository extends JpaRepository<WorkflowSettings, Long> {
}
