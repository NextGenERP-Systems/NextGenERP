package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.MaintenanceContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaintenanceContractRepository extends JpaRepository<MaintenanceContract, UUID> {
    List<MaintenanceContract> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);
    List<MaintenanceContract> findAllByOrderByCreatedAtDesc();

    @Query("SELECT mc FROM MaintenanceContract mc LEFT JOIN FETCH mc.items WHERE mc.id = :id")
    Optional<MaintenanceContract> findByIdWithItems(@Param("id") UUID id);
}
