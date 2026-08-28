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
}
