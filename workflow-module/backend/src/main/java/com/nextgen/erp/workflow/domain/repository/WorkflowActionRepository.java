package com.nextgen.erp.workflow.domain.repository;

import com.nextgen.erp.workflow.domain.model.WorkflowAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkflowActionRepository extends JpaRepository<WorkflowAction, UUID> {
    Optional<WorkflowAction> findByActionName(String actionName);
}
