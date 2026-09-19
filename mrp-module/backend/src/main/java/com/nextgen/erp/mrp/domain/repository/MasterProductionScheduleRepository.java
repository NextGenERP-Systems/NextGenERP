package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.MasterProductionSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MasterProductionScheduleRepository extends JpaRepository<MasterProductionSchedule, String> {
    List<MasterProductionSchedule> findByItemCode(String itemCode);
    List<MasterProductionSchedule> findByStatus(String status);
}
