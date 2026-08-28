package com.nextgen.erp.hrm.infrastructure.repository;

import com.nextgen.erp.hrm.domain.model.Enums.ApplicantStage;
import com.nextgen.erp.hrm.domain.model.JobApplicant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobApplicantRepository extends JpaRepository<JobApplicant, UUID> {
    List<JobApplicant> findByJobOpeningId(UUID jobOpeningId);
    List<JobApplicant> findByStage(ApplicantStage stage);
}
