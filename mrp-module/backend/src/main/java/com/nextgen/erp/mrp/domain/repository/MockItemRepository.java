package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.MockItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MockItemRepository extends JpaRepository<MockItem, String> {
}
