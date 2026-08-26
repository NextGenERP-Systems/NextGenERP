package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.CustomerGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerGroupRepository extends JpaRepository<CustomerGroup, UUID> {
    Optional<CustomerGroup> findByName(String name);
}
