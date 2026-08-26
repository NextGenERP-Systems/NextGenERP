package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.SalesInvoice;
import com.nextgen.erp.sales.domain.model.SalesInvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalesInvoiceRepository extends JpaRepository<SalesInvoice, UUID> {
    Optional<SalesInvoice> findByInvoiceNumber(String invoiceNumber);
    List<SalesInvoice> findBySalesOrderId(UUID salesOrderId);
    List<SalesInvoice> findByCustomerId(UUID customerId);
    List<SalesInvoice> findByStatus(SalesInvoiceStatus status);
    List<SalesInvoice> findAllByOrderByCreatedAtDesc();
}
