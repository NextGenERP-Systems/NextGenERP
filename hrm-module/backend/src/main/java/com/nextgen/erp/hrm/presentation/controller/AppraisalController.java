package com.nextgen.erp.hrm.presentation.controller;

import com.nextgen.erp.hrm.application.service.AppraisalService;
import com.nextgen.erp.hrm.domain.model.EmployeeAppraisal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/appraisals")
@RequiredArgsConstructor
@Tag(name = "Performance & Appraisals", description = "Endpoints for KRAs, performance reviews, and increment recommendations")
public class AppraisalController {

    private final AppraisalService appraisalService;

    @GetMapping
    @Operation(summary = "Get all appraisal reviews")
    public ResponseEntity<List<EmployeeAppraisal>> getAllAppraisals() {
        return ResponseEntity.ok(appraisalService.getAllAppraisals());
    }

    @PostMapping
    @Operation(summary = "Initiate an employee appraisal review")
    public ResponseEntity<EmployeeAppraisal> createAppraisal(@RequestBody EmployeeAppraisal appraisal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appraisalService.createAppraisal(appraisal));
    }

    @Data
    public static class CompleteAppraisalRequest {
        private BigDecimal selfScore;
        private BigDecimal managerScore;
        private String remarks;
        private Boolean promotionRecommended;
        private BigDecimal incrementPercentage;
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Submit scores and complete appraisal review")
    public ResponseEntity<EmployeeAppraisal> completeAppraisal(
            @PathVariable UUID id,
            @RequestBody CompleteAppraisalRequest request) {
        return ResponseEntity.ok(appraisalService.completeAppraisal(
                id, request.getSelfScore(), request.getManagerScore(), request.getRemarks(),
                request.getPromotionRecommended(), request.getIncrementPercentage()));
    }
}
