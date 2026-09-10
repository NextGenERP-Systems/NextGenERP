package com.nextgen.erp.projects.presentation.controller;

import com.nextgen.erp.projects.application.service.TimesheetService;
import com.nextgen.erp.projects.domain.model.Timesheet;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/timesheets")
@RequiredArgsConstructor
@Tag(name = "Timesheets", description = "Timesheet Management API")
public class TimesheetController {

    private final TimesheetService timesheetService;

    @GetMapping
    @Operation(summary = "Get all timesheets")
    public ResponseEntity<List<Timesheet>> getAllTimesheets() {
        return ResponseEntity.ok(timesheetService.getAllTimesheets());
    }

    @PostMapping
    @Operation(summary = "Create a new timesheet")
    public ResponseEntity<Timesheet> createTimesheet(@RequestBody Timesheet timesheet) {
        return new ResponseEntity<>(timesheetService.createTimesheet(timesheet), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a timesheet")
    public ResponseEntity<Timesheet> updateTimesheet(@PathVariable UUID id, @RequestBody Timesheet timesheet) {
        return ResponseEntity.ok(timesheetService.updateTimesheet(id, timesheet));
    }
}
