package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.Workstation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkstationRepository extends JpaRepository<Workstation, String> {
}
