package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.WorkOrderOperation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.UUID;

public interface WorkOrderOperationRepository extends JpaRepository<WorkOrderOperation, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM WorkOrderOperation o WHERE o.id = :id")
    java.util.Optional<WorkOrderOperation> findByIdForUpdate(@Param("id") UUID id);
}
