package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.Lead;
import com.nextgen.erp.sales.domain.model.LeadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID> {
    List<Lead> findByStatus(LeadStatus status);
    List<Lead> findAllByOrderByCreatedAtDesc();
}
