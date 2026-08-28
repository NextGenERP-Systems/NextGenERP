package com.nextgen.erp.workflow.domain.repository;

import com.nextgen.erp.workflow.domain.model.WorkflowState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowStateRepository extends JpaRepository<WorkflowState, UUID> {
    List<WorkflowState> findByWorkflowId(UUID workflowId);
}
