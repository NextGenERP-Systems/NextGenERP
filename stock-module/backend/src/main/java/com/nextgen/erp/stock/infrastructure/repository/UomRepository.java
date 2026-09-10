package com.nextgen.erp.stock.infrastructure.repository;

import com.nextgen.erp.stock.domain.model.Uom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UomRepository extends JpaRepository<Uom, String> {
    Optional<Uom> findByUomName(String uomName);
}
