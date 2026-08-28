package com.nextgen.erp.hrm.presentation.controller;

import com.nextgen.erp.hrm.application.service.AttendanceService;
import com.nextgen.erp.hrm.domain.model.AttendanceRecord;
import com.nextgen.erp.hrm.domain.model.Enums.AttendanceStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance & Shifts", description = "Endpoints for daily check-ins, logs, and attendance matrix")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    @Operation(summary = "Get daily attendance for a specific date")
    public ResponseEntity<List<AttendanceRecord>> getAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate queryDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(attendanceService.getAttendanceByDate(queryDate));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Get attendance logs for an employee across a date range")
    public ResponseEntity<List<AttendanceRecord>> getEmployeeAttendance(
            @PathVariable UUID employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getEmployeeAttendance(employeeId, startDate, endDate));
    }

    @Data
    public static class AttendanceLogRequest {
        private UUID employeeId;
        private LocalDate date;
        private AttendanceStatus status;
        private BigDecimal workingHours;
        private String remarks;
    }

    @PostMapping("/record")
    @Operation(summary = "Manually record or update an attendance log")
    public ResponseEntity<AttendanceRecord> recordAttendance(@RequestBody AttendanceLogRequest request) {
        LocalDate recordDate = (request.getDate() != null) ? request.getDate() : LocalDate.now();
        return ResponseEntity.ok(attendanceService.recordAttendance(
                request.getEmployeeId(), recordDate, request.getStatus(), request.getWorkingHours(), request.getRemarks()));
    }

    @PostMapping("/punch-in/{employeeId}")
    @Operation(summary = "Simulate automated web punch-in for employee")
    public ResponseEntity<AttendanceRecord> punchIn(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(attendanceService.punchIn(employeeId));
    }
}
