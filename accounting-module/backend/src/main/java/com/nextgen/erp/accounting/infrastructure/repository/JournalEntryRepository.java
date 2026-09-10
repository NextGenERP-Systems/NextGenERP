package com.nextgen.erp.accounting.infrastructure.repository;

import com.nextgen.erp.accounting.domain.model.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, UUID> {
    Optional<JournalEntry> findByVoucherNumber(String voucherNumber);
    List<JournalEntry> findAllByOrderByPostingDateDesc();
}
