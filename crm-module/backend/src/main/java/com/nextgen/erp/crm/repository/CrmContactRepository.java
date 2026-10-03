package com.nextgen.erp.crm.repository;

import com.nextgen.erp.crm.domain.model.CrmContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;

public interface CrmContactRepository extends JpaRepository<CrmContact, UUID> {
    List<CrmContact> findByLeadIdOrderByLastNameAscFirstNameAsc(UUID id);
    List<CrmContact> findByProspectIdOrderByLastNameAscFirstNameAsc(UUID id);
    List<CrmContact> findByOpportunityIdOrderByLastNameAscFirstNameAsc(UUID id);
    List<CrmContact> findByCustomerIdOrderByLastNameAscFirstNameAsc(UUID id);
    Page<CrmContact> findByLeadId(UUID id, Pageable pageable);
    Page<CrmContact> findByProspectId(UUID id, Pageable pageable);
    Page<CrmContact> findByOpportunityId(UUID id, Pageable pageable);
    Page<CrmContact> findByCustomerId(UUID id, Pageable pageable);
    List<CrmContact> findTop100ByCustomerIdOrderByLastNameAscFirstNameAsc(UUID id);
    List<CrmContact> findTop100ByProspectIdOrderByLastNameAscFirstNameAsc(UUID id);
    List<CrmContact> findTop100ByProspectIdInOrderByLastNameAscFirstNameAsc(java.util.Collection<UUID> ids);
    List<CrmContact> findTop100ByOpportunityIdInOrderByLastNameAscFirstNameAsc(java.util.Collection<UUID> ids);
}
