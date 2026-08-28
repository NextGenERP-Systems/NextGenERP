package com.nextgen.erp.hrm.presentation.controller;

import com.nextgen.erp.hrm.application.service.EmployeeService;
import com.nextgen.erp.hrm.domain.model.Branch;
import com.nextgen.erp.hrm.domain.model.Department;
import com.nextgen.erp.hrm.domain.model.Designation;
import com.nextgen.erp.hrm.domain.model.Employee;
import com.nextgen.erp.hrm.infrastructure.repository.BranchRepository;
import com.nextgen.erp.hrm.infrastructure.repository.DepartmentRepository;
import com.nextgen.erp.hrm.infrastructure.repository.DesignationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Employee 360 & Org Master", description = "Endpoints for employee directory, departments, designations, and branches")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;

    @GetMapping("/employees")
    @Operation(summary = "Get all employees in directory")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/employees/{id}")
    @Operation(summary = "Get employee 360 profile by ID")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable UUID id) {
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/employees")
    @Operation(summary = "Create and onboard a new employee")
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.createEmployee(employee));
    }

    @PutMapping("/employees/{id}")
    @Operation(summary = "Update employee master information")
    public ResponseEntity<Employee> updateEmployee(@PathVariable UUID id, @RequestBody Employee employee) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, employee));
    }

    @DeleteMapping("/employees/{id}")
    @Operation(summary = "Delete or archive employee")
    public ResponseEntity<Void> deleteEmployee(@PathVariable UUID id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/departments")
    @Operation(summary = "List all company departments")
    public ResponseEntity<List<Department>> getDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @GetMapping("/designations")
    @Operation(summary = "List all corporate designations")
    public ResponseEntity<List<Designation>> getDesignations() {
        return ResponseEntity.ok(designationRepository.findAll());
    }
}
