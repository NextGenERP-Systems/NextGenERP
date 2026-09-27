package com.nextgen.erp.stock.infrastructure.repository;

import com.nextgen.erp.stock.domain.model.LandedCostTax;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LandedCostTaxRepository extends JpaRepository<LandedCostTax, String> {
    List<LandedCostTax> findByVoucherId(String voucherId);
}
