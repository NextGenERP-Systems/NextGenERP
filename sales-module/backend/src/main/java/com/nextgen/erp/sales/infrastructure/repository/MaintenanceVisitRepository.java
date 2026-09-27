package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.MaintenanceVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaintenanceVisitRepository extends JpaRepository<MaintenanceVisit, UUID> {
    List<MaintenanceVisit> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);
    List<MaintenanceVisit> findByMaintenanceContractIdOrderByCreatedAtDesc(UUID contractId);
    List<MaintenanceVisit> findAllByOrderByCreatedAtDesc();

    @Query("SELECT mv FROM MaintenanceVisit mv LEFT JOIN FETCH mv.items WHERE mv.id = :id")
    Optional<MaintenanceVisit> findByIdWithItems(@Param("id") UUID id);
}
