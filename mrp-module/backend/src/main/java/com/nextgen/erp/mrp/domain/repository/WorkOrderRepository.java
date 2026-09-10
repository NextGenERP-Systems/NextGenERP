package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.WorkOrder;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, String> {

    List<WorkOrder> findByParentWoId(String parentWoId);

    List<WorkOrder> findByStatus(String status);

    /**
     * Pessimistic row lock (SELECT FOR UPDATE) to prevent concurrency race conditions
     * when multiple workers log consumption or completion simultaneously.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM WorkOrder w WHERE w.workOrderId = :id")
    Optional<WorkOrder> findByIdForUpdate(@Param("id") String id);
}
