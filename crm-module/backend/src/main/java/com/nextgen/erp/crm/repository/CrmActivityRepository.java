package com.nextgen.erp.crm.repository;
import com.nextgen.erp.crm.domain.model.CrmActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface CrmActivityRepository extends JpaRepository<CrmActivity,UUID> {
 Page<CrmActivity> findByTargetLeadId(UUID id, Pageable pageable);
 Page<CrmActivity> findByTargetProspectId(UUID id, Pageable pageable);
 Page<CrmActivity> findByTargetOpportunityId(UUID id, Pageable pageable);
 Page<CrmActivity> findByTargetProspectIdIn(java.util.Collection<UUID> ids, Pageable pageable);
 Page<CrmActivity> findByTargetOpportunityIdIn(java.util.Collection<UUID> ids, Pageable pageable);
}
