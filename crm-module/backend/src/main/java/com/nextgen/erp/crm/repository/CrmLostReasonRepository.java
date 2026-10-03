package com.nextgen.erp.crm.repository;
import com.nextgen.erp.crm.domain.model.CrmLostReason;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface CrmLostReasonRepository extends JpaRepository<CrmLostReason, UUID> {}
