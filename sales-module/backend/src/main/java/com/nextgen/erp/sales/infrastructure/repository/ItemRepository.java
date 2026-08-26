package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItemRepository extends JpaRepository<Item, UUID> {
    Optional<Item> findByItemCode(String itemCode);
    List<Item> findByIsSalesItemTrue();
}
