package com.nextgen.erp.crm.repository;
import com.nextgen.erp.crm.domain.model.CrmOpportunityType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface CrmOpportunityTypeRepository extends JpaRepository<CrmOpportunityType, UUID> {}
