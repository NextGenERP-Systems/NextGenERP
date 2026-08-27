package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.BlanketOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlanketOrderRepository extends JpaRepository<BlanketOrder, UUID> {
    Optional<BlanketOrder> findByBlanketOrderNumber(String blanketOrderNumber);

    List<BlanketOrder> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    @Query("SELECT bo FROM BlanketOrder bo LEFT JOIN FETCH bo.items WHERE bo.id = :id")
    Optional<BlanketOrder> findByIdWithItems(UUID id);

    List<BlanketOrder> findAllByOrderByCreatedAtDesc();
}
