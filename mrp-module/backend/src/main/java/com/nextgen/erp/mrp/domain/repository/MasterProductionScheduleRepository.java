package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.MasterProductionSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;

import java.util.List;

@Repository
public interface MasterProductionScheduleRepository extends JpaRepository<MasterProductionSchedule, String> {
    List<MasterProductionSchedule> findByItemCode(String itemCode);
    List<MasterProductionSchedule> findByStatus(String status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from MasterProductionSchedule m where m.mpsId = :mpsId")
    java.util.Optional<MasterProductionSchedule> findByMpsIdForUpdate(@Param("mpsId") String mpsId);
}
