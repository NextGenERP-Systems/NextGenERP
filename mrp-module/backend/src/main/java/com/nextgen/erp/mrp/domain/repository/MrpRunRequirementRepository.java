package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.MrpRunRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MrpRunRequirementRepository extends JpaRepository<MrpRunRequirement, UUID> {
    List<MrpRunRequirement> findByRunId(UUID runId);
}
