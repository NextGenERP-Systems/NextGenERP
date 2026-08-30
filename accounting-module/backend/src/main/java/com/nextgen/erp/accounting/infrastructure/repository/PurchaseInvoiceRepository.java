package com.nextgen.erp.accounting.infrastructure.repository;

import com.nextgen.erp.accounting.domain.model.Enums.InvoiceStatus;
import com.nextgen.erp.accounting.domain.model.PurchaseInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseInvoiceRepository extends JpaRepository<PurchaseInvoice, UUID> {
    Optional<PurchaseInvoice> findByBillNumber(String billNumber);
    List<PurchaseInvoice> findByStatus(InvoiceStatus status);
    List<PurchaseInvoice> findAllByOrderByPostingDateDesc();
}
