package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.ItemPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItemPriceRepository extends JpaRepository<ItemPrice, UUID> {
    Optional<ItemPrice> findByItemIdAndPriceListId(UUID itemId, UUID priceListId);
}
