package com.nextgen.erp.workflow.presentation.controller;

import com.nextgen.erp.workflow.domain.model.AppRole;
import com.nextgen.erp.workflow.domain.model.AppUser;
import com.nextgen.erp.workflow.domain.repository.AppRoleRepository;
import com.nextgen.erp.workflow.domain.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AppUserController {
    
    private final AppUserRepository userRepository;
    private final AppRoleRepository roleRepository;

    @GetMapping
    public ResponseEntity<List<AppUser>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/roles")
    public ResponseEntity<List<AppRole>> getAllRoles() {
        return ResponseEntity.ok(roleRepository.findAll());
    }

    @PostMapping("/roles")
    public ResponseEntity<AppRole> createRole(@RequestBody AppRole role) {
        if (role.getRoleName() != null) {
            role.setRoleName(role.getRoleName().toUpperCase());
        }
        return ResponseEntity.ok(roleRepository.save(role));
    }

    @PostMapping("/{userId}/assign-role")
    public ResponseEntity<AppUser> assignRole(@PathVariable UUID userId, @RequestParam String roleName) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        AppRole role = roleRepository.findByRoleNameIgnoreCase(roleName)
                .orElseGet(() -> roleRepository.save(AppRole.builder().roleName(roleName.toUpperCase()).build()));

        if (!user.getRoles().contains(role)) {
            user.getRoles().add(role);
            userRepository.save(user);
        }
        
        return ResponseEntity.ok(user);
    }
}

