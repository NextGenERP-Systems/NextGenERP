package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.SalesTaxAndCharge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SalesTaxAndChargeRepository extends JpaRepository<SalesTaxAndCharge, UUID> {
    List<SalesTaxAndCharge> findByVoucherTypeAndVoucherIdOrderByIdxAsc(String voucherType, UUID voucherId);
    void deleteByVoucherTypeAndVoucherId(String voucherType, UUID voucherId);
}
