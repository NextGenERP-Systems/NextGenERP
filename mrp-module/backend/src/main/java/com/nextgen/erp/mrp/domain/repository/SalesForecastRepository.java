package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.SalesForecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalesForecastRepository extends JpaRepository<SalesForecast, UUID> {
    Optional<SalesForecast> findByForecastId(String forecastId);
    List<SalesForecast> findByItemCode(String itemCode);
}
