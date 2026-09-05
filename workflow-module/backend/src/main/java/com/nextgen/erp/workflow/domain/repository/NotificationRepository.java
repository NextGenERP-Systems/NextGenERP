package com.nextgen.erp.workflow.domain.repository;

import com.nextgen.erp.workflow.domain.model.InAppNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<InAppNotification, UUID> {
    List<InAppNotification> findByUsernameOrderByCreatedAtDesc(String username);
    List<InAppNotification> findByUsernameAndIsReadFalseOrderByCreatedAtDesc(String username);
}
