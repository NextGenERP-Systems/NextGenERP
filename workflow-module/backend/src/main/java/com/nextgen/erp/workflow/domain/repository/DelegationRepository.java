package com.nextgen.erp.workflow.domain.repository;

import com.nextgen.erp.workflow.domain.model.Delegation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DelegationRepository extends JpaRepository<Delegation, UUID> {
    
    List<Delegation> findByDelegatorUsernameAndIsActiveTrue(String delegatorUsername);

    List<Delegation> findByDelegateeUsernameAndIsActiveTrue(String delegateeUsername);

    @Query("SELECT d FROM Delegation d WHERE d.delegateeUsername = :delegatee " +
           "AND d.isActive = true AND :now BETWEEN d.startDate AND d.endDate")
    List<Delegation> findActiveDelegationsForDelegatee(
            @Param("delegatee") String delegateeUsername,
            @Param("now") LocalDateTime now);

    @Query("SELECT d FROM Delegation d WHERE d.delegatorUsername = :delegator " +
           "AND d.isActive = true AND :now BETWEEN d.startDate AND d.endDate")
    List<Delegation> findActiveDelegationsForDelegator(
            @Param("delegator") String delegatorUsername,
            @Param("now") LocalDateTime now);
}
