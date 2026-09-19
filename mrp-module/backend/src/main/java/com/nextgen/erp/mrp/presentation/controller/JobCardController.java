package com.nextgen.erp.mrp.presentation.controller;

import com.nextgen.erp.mrp.application.service.JobCardService;
import com.nextgen.erp.mrp.domain.entity.JobCard;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/mrp/job-cards")
@RequiredArgsConstructor
@Tag(name = "Job Card Scheduling & Execution", description = "Shop Floor Execution, Timer Logs & Concurrency Control")
public class JobCardController {

    private final JobCardService jobCardService;

    @GetMapping
    @Operation(summary = "List all Job Cards")
    public ResponseEntity<List<JobCard>> getAllJobCards() {
        return ResponseEntity.ok(jobCardService.getAllJobCards());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Job Card details")
    public ResponseEntity<JobCard> getJobCardById(@PathVariable String id) {
        return ResponseEntity.ok(jobCardService.getJobCardById(id));
    }

    @PostMapping("/{id}/start")
    @Operation(summary = "Start timer log for a Job Card (Worker Execution)")
    public ResponseEntity<JobCard> startJobCard(@PathVariable String id, @RequestParam String employeeId) {
        return ResponseEntity.ok(jobCardService.startJobCard(id, employeeId));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete production quantity on Job Card with optional scrap recording & concurrency lock")
    public ResponseEntity<JobCard> completeJobCard(
            @PathVariable String id,
            @RequestParam BigDecimal completedQty,
            @RequestParam(required = false) BigDecimal scrapQty,
            @RequestParam(required = false) String scrapReason) {
        return ResponseEntity.ok(jobCardService.completeJobCard(id, completedQty, scrapQty, scrapReason));
    }

    @PostMapping("/{id}/schedule")
    @Operation(summary = "Capacity Scheduling: Auto-schedule Job Card on workstation without overbooking")
    public ResponseEntity<JobCard> scheduleJobCard(
            @PathVariable String id,
            @RequestParam(required = false) java.time.ZonedDateTime startFrom,
            @RequestParam(defaultValue = "60") long durationMins) {
        return ResponseEntity.ok(jobCardService.scheduleJobCard(id, startFrom, durationMins));
    }
}
