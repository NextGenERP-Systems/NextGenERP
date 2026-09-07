package com.nextgen.erp.projects.infrastructure.repository;

import com.nextgen.erp.projects.domain.model.ProjectTemplateTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface ProjectTemplateTaskRepository extends JpaRepository<ProjectTemplateTask, UUID> {
    List<ProjectTemplateTask> findByProjectTemplate_Id(UUID projectTemplateId);
    void deleteByProjectTemplate_Id(UUID projectTemplateId);
}
