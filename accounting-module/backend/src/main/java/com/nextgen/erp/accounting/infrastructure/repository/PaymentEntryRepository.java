package com.nextgen.erp.accounting.infrastructure.repository;

import com.nextgen.erp.accounting.domain.model.PaymentEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentEntryRepository extends JpaRepository<PaymentEntry, UUID> {
    Optional<PaymentEntry> findByPaymentNumber(String paymentNumber);
    List<PaymentEntry> findAllByOrderByPaymentDateDesc();
}
