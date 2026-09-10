package com.nextgen.erp.stock.infrastructure.repository;

import com.nextgen.erp.stock.domain.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, String> {
    Optional<Item> findByItemCode(String itemCode);
    List<Item> findByItemGroupId(String itemGroupId);
    List<Item> findByEnabledTrue();
}
