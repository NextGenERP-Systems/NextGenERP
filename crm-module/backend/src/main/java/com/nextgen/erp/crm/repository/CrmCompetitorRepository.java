package com.nextgen.erp.crm.repository;
import com.nextgen.erp.crm.domain.model.CrmCompetitor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface CrmCompetitorRepository extends JpaRepository<CrmCompetitor, UUID> {
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, UUID id);
}
