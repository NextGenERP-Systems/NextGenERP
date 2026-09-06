package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.JobCard;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobCardRepository extends JpaRepository<JobCard, String> {

    List<JobCard> findByWorkOrderId(String workOrderId);

    List<JobCard> findByWorkstationId(String workstationId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT j FROM JobCard j WHERE j.jobCardId = :id")
    Optional<JobCard> findByIdForUpdate(@Param("id") String id);
}
