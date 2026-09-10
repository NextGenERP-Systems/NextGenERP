package com.nextgen.erp.workflow.domain.repository;

import com.nextgen.erp.workflow.domain.model.WorkflowStateMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WorkflowStateMasterRepository extends JpaRepository<WorkflowStateMaster, UUID> {
}
