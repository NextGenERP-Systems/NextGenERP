package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.Territory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TerritoryRepository extends JpaRepository<Territory, UUID> {
    Optional<Territory> findByName(String name);
}
