package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.SupplierQuotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SupplierQuotationRepository extends JpaRepository<SupplierQuotation, UUID> {
    Optional<SupplierQuotation> findByQuotationNumber(String quotationNumber);
    List<SupplierQuotation> findByMaterialRequestId(UUID materialRequestId);
    List<SupplierQuotation> findBySupplierName(String supplierName);
    List<SupplierQuotation> findAllByOrderByCreatedAtDesc();

    @Query("SELECT sq FROM SupplierQuotation sq LEFT JOIN FETCH sq.items WHERE sq.id = :id")
    Optional<SupplierQuotation> findByIdWithItems(@Param("id") UUID id);
}
