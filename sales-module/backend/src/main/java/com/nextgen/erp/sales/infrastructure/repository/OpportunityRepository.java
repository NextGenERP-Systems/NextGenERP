package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.Opportunity;
import com.nextgen.erp.sales.domain.model.OpportunityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OpportunityRepository extends JpaRepository<Opportunity, UUID> {
    List<Opportunity> findByStatus(OpportunityStatus status);
    List<Opportunity> findAllByOrderByCreatedAtDesc();
}
