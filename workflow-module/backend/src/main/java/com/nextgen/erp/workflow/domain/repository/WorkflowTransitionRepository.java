package com.nextgen.erp.workflow.domain.repository;

import com.nextgen.erp.workflow.domain.model.WorkflowTransition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowTransitionRepository extends JpaRepository<WorkflowTransition, UUID> {
    List<WorkflowTransition> findByWorkflowId(UUID workflowId);
    List<WorkflowTransition> findByFromStateId(UUID fromStateId);
    List<WorkflowTransition> findByAllowedRole(String allowedRole);
    List<WorkflowTransition> findByWorkflowIdAndActionNameIgnoreCase(UUID workflowId, String actionName);
}
