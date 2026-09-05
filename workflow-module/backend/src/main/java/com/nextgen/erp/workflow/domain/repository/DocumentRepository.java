package com.nextgen.erp.workflow.domain.repository;

import com.nextgen.erp.workflow.domain.model.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    Optional<Document> findByDocumentNumber(String documentNumber);
    List<Document> findByOwnerUsername(String ownerUsername);
    List<Document> findByDocumentType(String documentType);

    @Query("SELECT d FROM Document d WHERE LOWER(d.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(d.documentNumber) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Document> searchDocuments(@Param("query") String query, Pageable pageable);
    
    Page<Document> findAll(Pageable pageable);
    
    Page<Document> findByCurrentStateIdIn(List<UUID> stateIds, Pageable pageable);

    @Query("SELECT DISTINCT d FROM Document d JOIN WorkflowTransition t ON d.currentStateId = t.fromStateId WHERE t.allowedRole IN :roles AND (d.assignedUsername IS NULL OR d.assignedUsername = :username)")
    Page<Document> findPendingDocumentsForRolesAndUser(@Param("roles") List<String> roles, @Param("username") String username, Pageable pageable);

    @Query("SELECT d FROM Document d WHERE " +
           "((:stateId IS NOT NULL AND d.currentStateId = :stateId) OR LOWER(d.status) = LOWER(:stateName)) " +
           "AND (:search IS NULL OR :search = '' OR LOWER(d.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(d.documentNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Document> findByStateOrStatusAndSearch(@Param("stateId") UUID stateId, @Param("stateName") String stateName, @Param("search") String search, Pageable pageable);
}
