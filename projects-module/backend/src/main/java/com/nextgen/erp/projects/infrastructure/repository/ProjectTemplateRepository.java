package com.nextgen.erp.projects.infrastructure.repository;

import com.nextgen.erp.projects.domain.model.ProjectTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProjectTemplateRepository extends JpaRepository<ProjectTemplate, UUID> {
}
