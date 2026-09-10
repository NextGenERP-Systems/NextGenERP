package com.nextgen.erp.workflow.domain.repository;

import com.nextgen.erp.workflow.domain.model.AppRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AppRoleRepository extends JpaRepository<AppRole, UUID> {
    Optional<AppRole> findByRoleName(String roleName);
    Optional<AppRole> findByRoleNameIgnoreCase(String roleName);
}

