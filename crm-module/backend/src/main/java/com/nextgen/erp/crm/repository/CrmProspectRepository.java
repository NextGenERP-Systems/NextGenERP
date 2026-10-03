package com.nextgen.erp.crm.repository;

import com.nextgen.erp.crm.domain.model.CrmProspect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CrmProspectRepository extends JpaRepository<CrmProspect, UUID> {
    java.util.List<CrmProspect> findByCustomerId(UUID customerId);
    java.util.List<CrmProspect> findTop100ByCustomerId(UUID customerId);
}
