package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.ItemGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItemGroupRepository extends JpaRepository<ItemGroup, UUID> {
    Optional<ItemGroup> findByItemGroupName(String itemGroupName);
}
