package com.nextgen.erp.hrm.presentation.controller;

import com.nextgen.erp.hrm.application.service.LeaveService;
import com.nextgen.erp.hrm.domain.model.LeaveAllocation;
import com.nextgen.erp.hrm.domain.model.LeaveApplication;
import com.nextgen.erp.hrm.domain.model.LeaveType;
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
@RequestMapping("/api/v1/leaves")
@RequiredArgsConstructor
@Tag(name = "Leave Management Engine", description = "Endpoints for leave applications, balances, and approval workflows")
public class LeaveController {

    private final LeaveService leaveService;

    @GetMapping
    @Operation(summary = "Get all submitted leave applications")
    public ResponseEntity<List<LeaveApplication>> getAllApplications() {
        return ResponseEntity.ok(leaveService.getAllApplications());
    }

    @GetMapping("/types")
    @Operation(summary = "Get configured leave types (PL, CL, SL, LOP)")
    public ResponseEntity<List<LeaveType>> getLeaveTypes() {
        return ResponseEntity.ok(leaveService.getAllLeaveTypes());
    }

    @GetMapping("/allocations/{employeeId}")
    @Operation(summary = "Get leave balances and allocations for an employee")
    public ResponseEntity<List<LeaveAllocation>> getEmployeeAllocations(
            @PathVariable UUID employeeId,
            @RequestParam(required = false) Integer fiscalYear) {
        return ResponseEntity.ok(leaveService.getEmployeeAllocations(employeeId, fiscalYear));
    }

    @PostMapping("/apply")
    @Operation(summary = "Submit a new leave application")
    public ResponseEntity<LeaveApplication> applyLeave(@RequestBody LeaveApplication application) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leaveService.applyLeave(application));
    }

    @Data
    public static class ApprovalRequest {
        private UUID approverId;
        private String rejectionReason;
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve a leave application and auto-deduct balance")
    public ResponseEntity<LeaveApplication> approveLeave(
            @PathVariable UUID id,
            @RequestBody(required = false) ApprovalRequest request) {
        UUID approverId = (request != null) ? request.getApproverId() : null;
        return ResponseEntity.ok(leaveService.approveLeave(id, approverId));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject a leave application with explanation")
    public ResponseEntity<LeaveApplication> rejectLeave(
            @PathVariable UUID id,
            @RequestBody(required = false) ApprovalRequest request) {
        String reason = (request != null) ? request.getRejectionReason() : "Application rejected by manager";
        return ResponseEntity.ok(leaveService.rejectLeave(id, reason));
    }
}
