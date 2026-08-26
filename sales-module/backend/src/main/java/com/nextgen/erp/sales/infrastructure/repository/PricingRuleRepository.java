package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.PricingRule;
import com.nextgen.erp.sales.domain.model.PricingRuleApplyOn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PricingRuleRepository extends JpaRepository<PricingRule, UUID> {
    List<PricingRule> findByApplyOnAndApplyKeyIdAndActiveTrue(PricingRuleApplyOn applyOn, String applyKeyId);
    List<PricingRule> findByActiveTrue();
    List<PricingRule> findAllByOrderByCreatedAtDesc();
}
