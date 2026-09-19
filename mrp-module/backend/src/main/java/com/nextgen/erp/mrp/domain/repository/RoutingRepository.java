package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.Routing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoutingRepository extends JpaRepository<Routing, String> {
    List<Routing> findByIsActiveTrue();
    List<Routing> findByItemCode(String itemCode);
}
