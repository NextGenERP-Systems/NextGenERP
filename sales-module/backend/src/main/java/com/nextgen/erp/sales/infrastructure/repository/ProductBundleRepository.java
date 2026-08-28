package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.ProductBundle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductBundleRepository extends JpaRepository<ProductBundle, UUID> {
    Optional<ProductBundle> findByNewItemCode(String newItemCode);
}
