package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.Operation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OperationRepository extends JpaRepository<Operation, String> {
}
