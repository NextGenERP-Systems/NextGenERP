package com.nextgen.erp.hrm.application.service;

import com.nextgen.erp.hrm.domain.model.AttendanceRecord;
import com.nextgen.erp.hrm.domain.model.Employee;
import com.nextgen.erp.hrm.domain.model.Enums.AttendanceStatus;
import com.nextgen.erp.hrm.infrastructure.repository.AttendanceRecordRepository;
import com.nextgen.erp.hrm.infrastructure.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<AttendanceRecord> getAttendanceByDate(LocalDate date) {
        return attendanceRecordRepository.findByAttendanceDate(date);
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecord> getEmployeeAttendance(UUID employeeId, LocalDate startDate, LocalDate endDate) {
        return attendanceRecordRepository.findByEmployeeIdAndAttendanceDateBetween(employeeId, startDate, endDate);
    }

    @Transactional
    public AttendanceRecord recordAttendance(UUID employeeId, LocalDate date, AttendanceStatus status, BigDecimal workingHours, String remarks) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + employeeId));

        Optional<AttendanceRecord> existing = attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(employeeId, date);
        AttendanceRecord record = existing.orElseGet(() -> AttendanceRecord.builder()
                .employee(employee)
                .attendanceDate(date)
                .build());

        record.setStatus(status != null ? status : AttendanceStatus.PRESENT);
        record.setWorkingHours(workingHours != null ? workingHours : BigDecimal.valueOf(8.00));
        record.setRemarks(remarks);
        if (record.getInTime() == null && status == AttendanceStatus.PRESENT) {
            record.setInTime(OffsetDateTime.now());
        }

        return attendanceRecordRepository.save(record);
    }

    @Transactional
    public AttendanceRecord punchIn(UUID employeeId) {
        return recordAttendance(employeeId, LocalDate.now(), AttendanceStatus.PRESENT, BigDecimal.valueOf(8.00), "Web Check-In");
    }
}
