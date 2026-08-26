package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.Quotation;
import com.nextgen.erp.sales.domain.model.QuotationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, UUID> {
    Optional<Quotation> findByQuotationNumber(String quotationNumber);
    List<Quotation> findByCustomerIdOrderByTransactionDateDesc(UUID customerId);
    List<Quotation> findByStatusOrderByTransactionDateDesc(QuotationStatus status);
    
    @Query("SELECT q FROM Quotation q LEFT JOIN FETCH q.items WHERE q.id = :id")
    Optional<Quotation> findByIdWithItems(UUID id);
    
    @Query("SELECT COUNT(q) FROM Quotation q WHERE q.status = :status")
    long countByStatus(QuotationStatus status);
}
