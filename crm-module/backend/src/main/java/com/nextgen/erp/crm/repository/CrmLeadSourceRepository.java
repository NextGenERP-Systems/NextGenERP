package com.nextgen.erp.crm.repository;
import com.nextgen.erp.crm.domain.model.CrmLeadSource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface CrmLeadSourceRepository extends JpaRepository<CrmLeadSource, UUID> {}
