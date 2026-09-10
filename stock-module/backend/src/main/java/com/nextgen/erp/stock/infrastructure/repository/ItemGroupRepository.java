package com.nextgen.erp.stock.infrastructure.repository;

import com.nextgen.erp.stock.domain.model.ItemGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ItemGroupRepository extends JpaRepository<ItemGroup, String> {
    Optional<ItemGroup> findByName(String name);
}
