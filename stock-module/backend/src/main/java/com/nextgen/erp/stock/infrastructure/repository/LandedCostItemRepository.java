package com.nextgen.erp.stock.infrastructure.repository;

import com.nextgen.erp.stock.domain.model.LandedCostItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LandedCostItemRepository extends JpaRepository<LandedCostItem, String> {
    List<LandedCostItem> findByVoucherId(String voucherId);
}
