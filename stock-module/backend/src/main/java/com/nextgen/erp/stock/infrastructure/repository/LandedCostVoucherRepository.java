package com.nextgen.erp.stock.infrastructure.repository;

import com.nextgen.erp.stock.domain.model.LandedCostVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LandedCostVoucherRepository extends JpaRepository<LandedCostVoucher, String> {
    Optional<LandedCostVoucher> findByVoucherNumber(String voucherNumber);
}
