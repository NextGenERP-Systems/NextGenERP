package com.nextgen.erp.crm.repository;
import com.nextgen.erp.crm.domain.model.CrmLeadHistory; import org.springframework.data.domain.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.UUID;
public interface CrmLeadHistoryRepository extends JpaRepository<CrmLeadHistory,UUID> { Page<CrmLeadHistory> findByLeadIdOrderByOccurredAtDescIdDesc(UUID leadId, Pageable pageable); }
