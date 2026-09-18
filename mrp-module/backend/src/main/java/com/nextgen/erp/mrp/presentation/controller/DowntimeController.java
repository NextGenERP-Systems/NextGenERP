package com.nextgen.erp.mrp.presentation.controller;

import com.nextgen.erp.mrp.application.service.DowntimeService;
import com.nextgen.erp.mrp.domain.entity.DowntimeEntry;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mrp/downtime")
@RequiredArgsConstructor
@Tag(name = "Workstation Downtime Tracking", description = "Workstation Downtime & Breakdown Logging APIs")
public class DowntimeController {

    private final DowntimeService downtimeService;

    @GetMapping
    @Operation(summary = "Get all workstation downtime entries")
    public ResponseEntity<List<DowntimeEntry>> getAllDowntimeEntries() {
        return ResponseEntity.ok(downtimeService.getAllDowntimeEntries());
    }

    @GetMapping("/workstation/{workstationId}")
    @Operation(summary = "Get downtime entries for a specific workstation")
    public ResponseEntity<List<DowntimeEntry>> getDowntimeByWorkstation(@PathVariable String workstationId) {
        return ResponseEntity.ok(downtimeService.getDowntimeByWorkstation(workstationId));
    }

    @PostMapping
    @Operation(summary = "Log a new workstation downtime entry")
    public ResponseEntity<DowntimeEntry> logDowntime(@RequestBody DowntimeEntry entry) {
        return ResponseEntity.ok(downtimeService.logDowntime(entry));
    }
}
