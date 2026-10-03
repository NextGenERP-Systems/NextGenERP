package com.nextgen.erp.crm.repository;
import com.nextgen.erp.crm.domain.model.CrmLeadProspectLink; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface CrmLeadProspectLinkRepository extends JpaRepository<CrmLeadProspectLink,UUID> { Optional<CrmLeadProspectLink> findByLeadId(UUID leadId); }
