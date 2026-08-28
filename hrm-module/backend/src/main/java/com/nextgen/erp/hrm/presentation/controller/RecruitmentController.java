package com.nextgen.erp.hrm.presentation.controller;

import com.nextgen.erp.hrm.application.service.RecruitmentService;
import com.nextgen.erp.hrm.domain.model.Enums.ApplicantStage;
import com.nextgen.erp.hrm.domain.model.JobApplicant;
import com.nextgen.erp.hrm.domain.model.JobOpening;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recruitment")
@RequiredArgsConstructor
@Tag(name = "Recruitment & Talent Pipeline", description = "Endpoints for job postings, candidate pipelines, and hiring stages")
public class RecruitmentController {

    private final RecruitmentService recruitmentService;

    @GetMapping("/jobs")
    @Operation(summary = "Get all active job openings")
    public ResponseEntity<List<JobOpening>> getJobOpenings() {
        return ResponseEntity.ok(recruitmentService.getAllJobOpenings());
    }

    @PostMapping("/jobs")
    @Operation(summary = "Create a new job vacancy posting")
    public ResponseEntity<JobOpening> createJobOpening(@RequestBody JobOpening opening) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recruitmentService.createJobOpening(opening));
    }

    @GetMapping("/applicants")
    @Operation(summary = "Get all applicants across pipeline stages")
    public ResponseEntity<List<JobApplicant>> getApplicants() {
        return ResponseEntity.ok(recruitmentService.getAllApplicants());
    }

    @PostMapping("/applicants")
    @Operation(summary = "Add a candidate to the hiring pipeline")
    public ResponseEntity<JobApplicant> addApplicant(@RequestBody JobApplicant applicant) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recruitmentService.addApplicant(applicant));
    }

    @Data
    public static class StageUpdateRequest {
        private ApplicantStage stage;
        private String notes;
    }

    @PatchMapping("/applicants/{id}/stage")
    @Operation(summary = "Progress candidate to next pipeline stage (e.g., TECH_INTERVIEW -> OFFER_MADE)")
    public ResponseEntity<JobApplicant> updateStage(
            @PathVariable UUID id,
            @RequestBody StageUpdateRequest request) {
        return ResponseEntity.ok(recruitmentService.updateApplicantStage(id, request.getStage(), request.getNotes()));
    }
}
