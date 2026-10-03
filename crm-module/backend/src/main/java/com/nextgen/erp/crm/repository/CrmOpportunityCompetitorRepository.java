package com.nextgen.erp.crm.repository;
import com.nextgen.erp.crm.domain.model.CrmOpportunityCompetitor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
public interface CrmOpportunityCompetitorRepository extends JpaRepository<CrmOpportunityCompetitor, UUID> {
    List<CrmOpportunityCompetitor> findByOpportunityIdOrderByCreatedAtDesc(UUID opportunityId);
    Optional<CrmOpportunityCompetitor> findByOpportunityIdAndCompetitorId(UUID opportunityId, UUID competitorId);
    List<CrmOpportunityCompetitor> findByOpportunityIdInOrderByCreatedAtDesc(java.util.Collection<UUID> opportunityIds);
}
