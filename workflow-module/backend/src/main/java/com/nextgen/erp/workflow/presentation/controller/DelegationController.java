package com.nextgen.erp.workflow.presentation.controller;

import com.nextgen.erp.workflow.domain.model.Delegation;
import com.nextgen.erp.workflow.domain.repository.DelegationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/delegations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DelegationController {

    private final DelegationRepository delegationRepository;

    @GetMapping
    public ResponseEntity<List<Delegation>> getDelegations(@RequestParam(required = false) String username) {
        if (username != null && !username.isBlank()) {
            return ResponseEntity.ok(delegationRepository.findByDelegatorUsernameAndIsActiveTrue(username));
        }
        return ResponseEntity.ok(delegationRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Delegation> createDelegation(@RequestBody Delegation delegation) {
        if (delegation.getStartDate() == null) {
            delegation.setStartDate(LocalDateTime.now());
        }
        if (delegation.getEndDate() == null) {
            delegation.setEndDate(LocalDateTime.now().plusDays(7)); // Default 7 days
        }
        delegation.setIsActive(true);
        return ResponseEntity.ok(delegationRepository.save(delegation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelDelegation(@PathVariable UUID id) {
        delegationRepository.findById(id).ifPresent(d -> {
            d.setIsActive(false);
            delegationRepository.save(d);
        });
        return ResponseEntity.noContent().build();
    }
}
