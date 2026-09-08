package com.nextgen.erp.crm.repository;

import com.nextgen.erp.crm.domain.model.CrmOpportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CrmOpportunityRepository extends JpaRepository<CrmOpportunity, UUID> {
}
