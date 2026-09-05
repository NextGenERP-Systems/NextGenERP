package com.nextgen.erp.workflow.domain.repository;

import com.nextgen.erp.workflow.domain.model.WorkflowHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowHistoryRepository extends JpaRepository<WorkflowHistory, UUID> {
    List<WorkflowHistory> findByDocumentIdOrderByCreatedAtDesc(UUID documentId);

    void deleteByDocumentId(UUID documentId);

    @Query("SELECT h FROM WorkflowHistory h WHERE " +
           "(:search IS NULL OR :search = '' OR LOWER(h.performedBy) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(h.actionName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(h.comments) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<WorkflowHistory> searchAuditLogs(@Param("search") String search, Pageable pageable);
}
