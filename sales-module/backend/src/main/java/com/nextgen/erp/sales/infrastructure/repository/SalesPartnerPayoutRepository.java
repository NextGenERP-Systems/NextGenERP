package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.SalesPartnerPayout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SalesPartnerPayoutRepository extends JpaRepository<SalesPartnerPayout, UUID> {
    List<SalesPartnerPayout> findBySalesPartnerIdOrderByCreatedAtDesc(UUID salesPartnerId);
    List<SalesPartnerPayout> findAllByOrderByCreatedAtDesc();
}
