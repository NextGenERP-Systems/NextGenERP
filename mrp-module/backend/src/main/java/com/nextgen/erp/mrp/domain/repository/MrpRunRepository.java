package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.MrpRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.UUID;

@Repository
public interface MrpRunRepository extends JpaRepository<MrpRun, UUID> {
    java.util.List<MrpRun> findAllByOrderByCreatedAtDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM MrpRun r WHERE r.runId = :runId")
    java.util.Optional<MrpRun> findByRunIdForUpdate(@Param("runId") UUID runId);
}
