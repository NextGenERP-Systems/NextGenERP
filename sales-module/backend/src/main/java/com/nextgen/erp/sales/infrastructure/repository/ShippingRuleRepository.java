package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.ShippingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShippingRuleRepository extends JpaRepository<ShippingRule, UUID> {
    Optional<ShippingRule> findByShippingRuleName(String shippingRuleName);
}
