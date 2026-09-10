package com.nextgen.erp.projects.infrastructure.repository;

import com.nextgen.erp.projects.domain.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByProject_Id(UUID projectId);
}
