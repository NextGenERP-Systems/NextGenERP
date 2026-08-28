package com.nextgen.erp.hrm.infrastructure.repository;

import com.nextgen.erp.hrm.domain.model.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveType, UUID> {
    Optional<LeaveType> findByLeaveTypeCode(String leaveTypeCode);
}
