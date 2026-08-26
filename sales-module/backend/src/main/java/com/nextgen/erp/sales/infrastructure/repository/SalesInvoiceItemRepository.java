package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.SalesInvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SalesInvoiceItemRepository extends JpaRepository<SalesInvoiceItem, UUID> {
    List<SalesInvoiceItem> findBySalesInvoiceId(UUID salesInvoiceId);
}
