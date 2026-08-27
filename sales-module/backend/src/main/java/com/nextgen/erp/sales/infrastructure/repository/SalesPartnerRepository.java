package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.SalesPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalesPartnerRepository extends JpaRepository<SalesPartner, UUID> {
    Optional<SalesPartner> findByPartnerName(String partnerName);

    List<SalesPartner> findAllByOrderByCreatedAtDesc();
}
