package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.SupplierQuotationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SupplierQuotationItemRepository extends JpaRepository<SupplierQuotationItem, UUID> {
    List<SupplierQuotationItem> findBySupplierQuotationId(UUID supplierQuotationId);
}
