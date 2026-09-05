package com.nextgen.erp.workflow.domain.repository;

import com.nextgen.erp.workflow.domain.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {
    Optional<AppUser> findByUsername(String username);
    List<AppUser> findByRoles_RoleName(String roleName);
}
