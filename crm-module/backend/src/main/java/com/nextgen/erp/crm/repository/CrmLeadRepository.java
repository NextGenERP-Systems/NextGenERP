package com.nextgen.erp.crm.repository;

import com.nextgen.erp.crm.domain.model.CrmLead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CrmLeadRepository extends JpaRepository<CrmLead, UUID> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"leadSource", "marketSegment"})
    java.util.List<CrmLead> findAll();
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"leadSource", "marketSegment"})
    java.util.Optional<CrmLead> findById(UUID id);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select l from CrmLead l where l.id = :id")
    java.util.Optional<CrmLead> findForQualification(@org.springframework.data.repository.query.Param("id") UUID id);
}
