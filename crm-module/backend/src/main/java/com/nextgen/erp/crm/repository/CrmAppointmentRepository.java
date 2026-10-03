package com.nextgen.erp.crm.repository;
import com.nextgen.erp.crm.domain.model.CrmAppointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface CrmAppointmentRepository extends JpaRepository<CrmAppointment,UUID> {
 Page<CrmAppointment> findByTargetLeadId(UUID id, Pageable pageable);
 Page<CrmAppointment> findByTargetProspectId(UUID id, Pageable pageable);
 Page<CrmAppointment> findByTargetOpportunityId(UUID id, Pageable pageable);
 Page<CrmAppointment> findByTargetProspectIdIn(java.util.Collection<UUID> ids, Pageable pageable);
 Page<CrmAppointment> findByTargetOpportunityIdIn(java.util.Collection<UUID> ids, Pageable pageable);
}
