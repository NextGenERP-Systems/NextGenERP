package com.nextgen.erp.sales.infrastructure.repository;

import com.nextgen.erp.sales.domain.model.PackingSlip;
import com.nextgen.erp.sales.domain.model.PackingSlipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PackingSlipRepository extends JpaRepository<PackingSlip, UUID> {

    List<PackingSlip> findByDeliveryNoteIdOrderByCreatedAtDesc(UUID deliveryNoteId);

    List<PackingSlip> findByStatusOrderByCreatedAtDesc(PackingSlipStatus status);

    Optional<PackingSlip> findByPackingSlipNumber(String packingSlipNumber);

    @Query("SELECT ps FROM PackingSlip ps LEFT JOIN FETCH ps.items WHERE ps.id = :id")
    Optional<PackingSlip> findByIdWithItems(@Param("id") UUID id);

    @Query("SELECT ps FROM PackingSlip ps LEFT JOIN FETCH ps.items ORDER BY ps.createdAt DESC")
    List<PackingSlip> findAllWithItems();

    long countByDeliveryNoteId(UUID deliveryNoteId);
}
