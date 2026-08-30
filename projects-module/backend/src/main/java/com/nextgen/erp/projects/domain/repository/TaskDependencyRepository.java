package com.nextgen.erp.projects.domain.repository;

import com.nextgen.erp.projects.domain.model.TaskDependency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskDependencyRepository extends JpaRepository<TaskDependency, UUID> {
    List<TaskDependency> findByPredecessorId(UUID predecessorId);
    List<TaskDependency> findBySuccessorId(UUID successorId);
}
