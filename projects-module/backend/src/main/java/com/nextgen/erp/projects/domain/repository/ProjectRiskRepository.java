package com.nextgen.erp.projects.domain.repository;

import com.nextgen.erp.projects.domain.model.ProjectRisk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRiskRepository extends JpaRepository<ProjectRisk, UUID> {
    List<ProjectRisk> findByProjectId(UUID projectId);
}
