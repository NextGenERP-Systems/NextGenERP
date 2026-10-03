package com.nextgen.erp.crm.repository;
import com.nextgen.erp.crm.domain.model.CrmNote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface CrmNoteRepository extends JpaRepository<CrmNote,UUID> {
 Page<CrmNote> findByTargetLeadId(UUID id, Pageable pageable);
 Page<CrmNote> findByTargetProspectId(UUID id, Pageable pageable);
 Page<CrmNote> findByTargetOpportunityId(UUID id, Pageable pageable);
 Page<CrmNote> findByTargetProspectIdIn(java.util.Collection<UUID> ids, Pageable pageable);
 Page<CrmNote> findByTargetOpportunityIdIn(java.util.Collection<UUID> ids, Pageable pageable);
}
