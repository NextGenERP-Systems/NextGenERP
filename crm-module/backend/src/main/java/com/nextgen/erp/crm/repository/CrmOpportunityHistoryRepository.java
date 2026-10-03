package com.nextgen.erp.crm.repository;
import com.nextgen.erp.crm.domain.model.CrmOpportunityHistory; import org.springframework.data.domain.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.UUID;
public interface CrmOpportunityHistoryRepository extends JpaRepository<CrmOpportunityHistory,UUID> {
 Page<CrmOpportunityHistory> findByOpportunityIdOrderByOccurredAtDescIdDesc(UUID opportunityId, Pageable pageable);
 Page<CrmOpportunityHistory> findByOpportunityIdInOrderByOccurredAtDescIdDesc(java.util.Collection<UUID> opportunityIds, Pageable pageable);
}
