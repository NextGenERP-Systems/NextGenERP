package com.nextgen.erp.workflow.domain.repository;

import com.nextgen.erp.workflow.domain.model.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, UUID> {
    Optional<Workflow> findByWorkflowName(String workflowName);
    Optional<Workflow> findByDocumentTypeAndIsActiveTrue(String documentType);
    Optional<Workflow> findFirstByDocumentTypeAndIsActiveTrueOrderByVersionDesc(String documentType);
    List<Workflow> findByWorkflowNameOrderByVersionDesc(String workflowName);
}
