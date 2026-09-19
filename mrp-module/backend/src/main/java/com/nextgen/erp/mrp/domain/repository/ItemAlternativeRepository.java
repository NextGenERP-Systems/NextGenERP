package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.ItemAlternative;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ItemAlternativeRepository extends JpaRepository<ItemAlternative, UUID> {
    List<ItemAlternative> findByItemCode(String itemCode);
}
