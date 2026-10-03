package com.nextgen.erp.crm.repository;

import com.nextgen.erp.crm.domain.model.CrmOpportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CrmOpportunityRepository extends JpaRepository<CrmOpportunity, UUID> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"prospect", "salesStage", "opportunityType", "lostReason"})
    java.util.List<CrmOpportunity> findAll();
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"prospect", "salesStage", "opportunityType", "lostReason"})
    java.util.Optional<CrmOpportunity> findById(UUID id);
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"prospect", "salesStage", "opportunityType", "lostReason"})
    java.util.List<CrmOpportunity> findByCustomerIdOrderByUpdatedAtDesc(UUID customerId);
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"prospect", "salesStage", "opportunityType", "lostReason"})
    java.util.List<CrmOpportunity> findTop100ByCustomerIdOrderByUpdatedAtDesc(UUID customerId);
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"prospect", "salesStage", "opportunityType", "lostReason"})
    java.util.List<CrmOpportunity> findByProspectIdOrderByUpdatedAtDesc(UUID prospectId);
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"prospect", "salesStage", "opportunityType", "lostReason"})
    java.util.List<CrmOpportunity> findTop100ByProspectIdOrderByUpdatedAtDesc(UUID prospectId);
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"prospect", "salesStage", "opportunityType", "lostReason"})
    java.util.List<CrmOpportunity> findTop100ByProspectIdInOrderByUpdatedAtDesc(java.util.Collection<UUID> prospectIds);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select o from CrmOpportunity o where o.id = :id")
    java.util.Optional<CrmOpportunity> findForUpdate(@org.springframework.data.repository.query.Param("id") UUID id);
}
