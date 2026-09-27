package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.SubcontractOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubcontractOrderRepository extends JpaRepository<SubcontractOrder, String> {
    List<SubcontractOrder> findByWorkOrderId(String workOrderId);
    List<SubcontractOrder> findBySupplierId(String supplierId);
}
