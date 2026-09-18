package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.ScrapItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ScrapItemRepository extends JpaRepository<ScrapItem, UUID> {

    List<ScrapItem> findByWorkOrderId(String workOrderId);
}
