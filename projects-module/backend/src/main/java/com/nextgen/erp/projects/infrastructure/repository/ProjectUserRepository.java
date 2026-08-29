package com.nextgen.erp.projects.infrastructure.repository;

import com.nextgen.erp.projects.domain.model.ProjectUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface ProjectUserRepository extends JpaRepository<ProjectUser, UUID> {
    List<ProjectUser> findByProjectId(UUID projectId);
}
