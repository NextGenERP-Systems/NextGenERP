package com.nextgen.erp.stock.infrastructure.repository;

import com.nextgen.erp.stock.domain.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, String> {
    Optional<Batch> findByBatchId(String batchId);
    List<Batch> findByItemId(String itemId);
}
