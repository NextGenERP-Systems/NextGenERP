package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.PriceList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PriceListRepository extends JpaRepository<PriceList, UUID> {
    Optional<PriceList> findByPriceListName(String priceListName);
}
