package com.nextgen.erp.hrm.application.service;

import com.nextgen.erp.hrm.domain.model.Department;
import com.nextgen.erp.hrm.domain.model.Designation;
import com.nextgen.erp.hrm.domain.model.Employee;
import com.nextgen.erp.hrm.domain.model.Enums.EmployeeStatus;
import com.nextgen.erp.hrm.infrastructure.repository.DepartmentRepository;
import com.nextgen.erp.hrm.infrastructure.repository.DesignationRepository;
import com.nextgen.erp.hrm.infrastructure.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;

    @Transactional(readOnly = true)
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Employee> getEmployeeById(UUID id) {
        return employeeRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Employee> getEmployeeByCode(String code) {
        return employeeRepository.findByEmployeeCode(code);
    }

    @Transactional
    public Employee createEmployee(Employee employee) {
        if (employee.getEmployeeCode() == null || employee.getEmployeeCode().isBlank()) {
            long count = employeeRepository.count() + 1;
            employee.setEmployeeCode(String.format("EMP-%03d", count));
        }
        if (employee.getDateOfJoining() == null) {
            employee.setDateOfJoining(LocalDate.now());
        }
        return employeeRepository.save(employee);
    }

    @Transactional
    public Employee updateEmployee(UUID id, Employee updated) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + id));

        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setGender(updated.getGender());
        existing.setWorkEmail(updated.getWorkEmail());
        existing.setCellNumber(updated.getCellNumber());
        existing.setStatus(updated.getStatus());
        existing.setEmploymentType(updated.getEmploymentType());
        existing.setDepartment(updated.getDepartment());
        existing.setDesignation(updated.getDesignation());
        existing.setBranch(updated.getBranch());
        existing.setEmergencyContactName(updated.getEmergencyContactName());
        existing.setEmergencyPhone(updated.getEmergencyPhone());
        existing.setPanNumber(updated.getPanNumber());
        existing.setPfNumber(updated.getPfNumber());
        existing.setBankName(updated.getBankName());
        existing.setBankAccountNumber(updated.getBankAccountNumber());
        existing.setIfscCode(updated.getIfscCode());

        return employeeRepository.save(existing);
    }

    @Transactional
    public void deleteEmployee(UUID id) {
        employeeRepository.deleteById(id);
    }
}
