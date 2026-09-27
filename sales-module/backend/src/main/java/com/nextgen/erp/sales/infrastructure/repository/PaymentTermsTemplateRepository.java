package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.PaymentTermsTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentTermsTemplateRepository extends JpaRepository<PaymentTermsTemplate, UUID> {
    Optional<PaymentTermsTemplate> findByTemplateName(String templateName);

    @Query("SELECT ptt FROM PaymentTermsTemplate ptt LEFT JOIN FETCH ptt.items WHERE ptt.id = :id")
    Optional<PaymentTermsTemplate> findByIdWithItems(@Param("id") UUID id);

    @Query("SELECT ptt FROM PaymentTermsTemplate ptt LEFT JOIN FETCH ptt.items WHERE ptt.templateName = :templateName")
    Optional<PaymentTermsTemplate> findByNameWithItems(@Param("templateName") String templateName);

    List<PaymentTermsTemplate> findAllByOrderByTemplateNameAsc();
}
