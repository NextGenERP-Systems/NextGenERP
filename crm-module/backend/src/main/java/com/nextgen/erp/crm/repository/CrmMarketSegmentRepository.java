package com.nextgen.erp.crm.repository;
import com.nextgen.erp.crm.domain.model.CrmMarketSegment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface CrmMarketSegmentRepository extends JpaRepository<CrmMarketSegment, UUID> {}
