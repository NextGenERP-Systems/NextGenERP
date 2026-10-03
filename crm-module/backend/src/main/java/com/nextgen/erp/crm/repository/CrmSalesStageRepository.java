package com.nextgen.erp.crm.repository;
import com.nextgen.erp.crm.domain.model.CrmSalesStage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface CrmSalesStageRepository extends JpaRepository<CrmSalesStage, UUID> {}
