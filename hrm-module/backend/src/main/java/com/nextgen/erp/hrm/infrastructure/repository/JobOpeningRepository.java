package com.nextgen.erp.hrm.infrastructure.repository;

import com.nextgen.erp.hrm.domain.model.Enums.JobStatus;
import com.nextgen.erp.hrm.domain.model.JobOpening;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobOpeningRepository extends JpaRepository<JobOpening, UUID> {
    Optional<JobOpening> findByJobCode(String jobCode);
    List<JobOpening> findByStatus(JobStatus status);
}
