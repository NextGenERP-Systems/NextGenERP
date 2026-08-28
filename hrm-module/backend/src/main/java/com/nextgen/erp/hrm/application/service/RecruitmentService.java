package com.nextgen.erp.hrm.application.service;

import com.nextgen.erp.hrm.domain.model.Enums.ApplicantStage;
import com.nextgen.erp.hrm.domain.model.Enums.JobStatus;
import com.nextgen.erp.hrm.domain.model.JobApplicant;
import com.nextgen.erp.hrm.domain.model.JobOpening;
import com.nextgen.erp.hrm.infrastructure.repository.JobApplicantRepository;
import com.nextgen.erp.hrm.infrastructure.repository.JobOpeningRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecruitmentService {

    private final JobOpeningRepository jobOpeningRepository;
    private final JobApplicantRepository jobApplicantRepository;

    @Transactional(readOnly = true)
    public List<JobOpening> getAllJobOpenings() {
        return jobOpeningRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<JobApplicant> getAllApplicants() {
        return jobApplicantRepository.findAll();
    }

    @Transactional
    public JobOpening createJobOpening(JobOpening opening) {
        if (opening.getJobCode() == null || opening.getJobCode().isBlank()) {
            long count = jobOpeningRepository.count() + 1;
            opening.setJobCode(String.format("JOB-2026-%03d", count));
        }
        return jobOpeningRepository.save(opening);
    }

    @Transactional
    public JobApplicant addApplicant(JobApplicant applicant) {
        return jobApplicantRepository.save(applicant);
    }

    @Transactional
    public JobApplicant updateApplicantStage(UUID applicantId, ApplicantStage newStage, String notes) {
        JobApplicant applicant = jobApplicantRepository.findById(applicantId)
                .orElseThrow(() -> new IllegalArgumentException("Applicant not found: " + applicantId));
        applicant.setStage(newStage);
        if (notes != null && !notes.isBlank()) {
            applicant.setNotes(notes);
        }
        return jobApplicantRepository.save(applicant);
    }
}
