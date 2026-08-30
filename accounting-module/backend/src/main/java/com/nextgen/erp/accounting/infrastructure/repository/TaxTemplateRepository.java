package com.nextgen.erp.accounting.infrastructure.repository;

import com.nextgen.erp.accounting.domain.model.TaxTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TaxTemplateRepository extends JpaRepository<TaxTemplate, UUID> {
}
