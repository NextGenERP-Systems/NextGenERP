package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.Bom;
import com.nextgen.erp.mrp.domain.repository.BomRepository;
import com.nextgen.erp.mrp.domain.repository.StateTransitionAuditRepository;
import com.nextgen.erp.mrp.domain.entity.StateTransitionAudit;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BomService {

    private static final Set<String> ALLOWED_STATUSES = Set.of("DRAFT", "ACTIVE", "INACTIVE", "OBSOLETE");

    private final BomRepository bomRepository;
    private final StateTransitionAuditRepository stateTransitionAuditRepository;

    @Transactional(readOnly = true)
    public List<Bom> getAllBoms() {
        return bomRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Bom getBomByNo(String bomNo) {
        return bomRepository.findById(bomNo)
                .orElseThrow(() -> new IllegalArgumentException("BOM not found with No: " + bomNo));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> explodeBomViaCte(String bomNo) {
        return bomRepository.explodeBomWithCte(bomNo);
    }

    @Transactional
    public int replaceItemInAllBoms(String currentItemCode, String newItemCode, String newItemName, BigDecimal newRate) {
        List<Bom> boms = bomRepository.findAll();
        int count = 0;
        for (Bom bom : boms) {
            if ("ACTIVE".equalsIgnoreCase(bom.getStatus())) {
                throw new IllegalStateException("Active BOM " + bom.getBomNo()
                        + " is immutable; create a new BOM revision instead");
            }
            boolean updated = false;
            for (var item : bom.getItems()) {
                if (item.getItemCode().equals(currentItemCode)) {
                    item.setItemCode(newItemCode);
                    item.setItemName(newItemName);
                    if (newRate != null) {
                        item.setStandardRate(newRate);
                        item.setAmount(newRate.multiply(item.getQty()));
                    }
                    updated = true;
                }
            }
            if (updated) {
                bom.setRevisionNumber(bom.getRevisionNumber() + 1);
                bomRepository.save(bom);
                count++;
            }
        }
        return count;
    }

    @Transactional
    public Bom saveBom(Bom bom) {
        validateBom(bom);
        var existing = bomRepository.findById(bom.getBomNo());
        if (existing != null && existing.isPresent()
                && "ACTIVE".equalsIgnoreCase(existing.get().getStatus())) {
            throw new IllegalStateException("Active BOM " + bom.getBomNo()
                    + " is immutable; create a new BOM revision instead");
        }
        if (bom.getRevisionNumber() == null) {
            bom.setRevisionNumber(1);
        }
        var sameRevision = bomRepository.findById(bom.getBomNo());
        if ((sameRevision == null || sameRevision.isEmpty())
                && bomRepository.existsByItemCodeAndRevisionNumber(bom.getItemCode(), bom.getRevisionNumber())) {
            throw new IllegalArgumentException("BOM revision already exists for item " + bom.getItemCode()
                    + ": " + bom.getRevisionNumber());
        }
        String status = bom.getStatus() == null || bom.getStatus().isBlank()
                ? "DRAFT" : bom.getStatus().toUpperCase();
        if (!ALLOWED_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Unsupported BOM status: " + bom.getStatus());
        }
        bom.setStatus(status);
        return bomRepository.save(bom);
    }

    @Transactional
    public Bom approveBom(String bomNo) {
        Bom bom = bomRepository.findById(bomNo)
                .orElseThrow(() -> new IllegalArgumentException("BOM not found with No: " + bomNo));
        if (!"DRAFT".equalsIgnoreCase(bom.getStatus())) {
            throw new IllegalStateException("BOM " + bomNo + " cannot be approved from status " + bom.getStatus());
        }
        validateBom(bom);
        String previousStatus = bom.getStatus();
        bom.setStatus("ACTIVE");
        StateTransitionAudit audit = new StateTransitionAudit();
        audit.setEntityType("BOM");
        audit.setEntityId(bomNo);
        audit.setFromStatus(previousStatus);
        audit.setToStatus("ACTIVE");
        audit.setAction("APPROVE");
        stateTransitionAuditRepository.save(audit);
        return bomRepository.save(bom);
    }

    private void validateBom(Bom bom) {
        if (bom == null || isBlank(bom.getBomNo()) || isBlank(bom.getItemCode())) {
            throw new IllegalArgumentException("BOM number and item code are required");
        }
        if (bom.getQuantity() == null || bom.getQuantity().signum() <= 0) {
            throw new IllegalArgumentException("BOM quantity must be greater than zero");
        }
        if (bom.getEffectiveFrom() != null && bom.getEffectiveTo() != null
                && bom.getEffectiveTo().isBefore(bom.getEffectiveFrom())) {
            throw new IllegalArgumentException("BOM effective-to date cannot precede effective-from date");
        }
        if (bom.getRevisionNumber() != null && bom.getRevisionNumber() <= 0) {
            throw new IllegalArgumentException("BOM revision number must be greater than zero");
        }
        for (var item : bom.getItems()) {
            if (isBlank(item.getItemCode()) || item.getQty() == null || item.getQty().signum() <= 0) {
                throw new IllegalArgumentException("Every BOM item requires an item code and positive quantity");
            }
            if (bom.getBomNo().equals(item.getSubBomNo())) {
                throw new IllegalArgumentException("BOM cannot reference itself: " + bom.getBomNo());
            }
        }

        Map<String, Bom> graph = new HashMap<>();
        List<Bom> existingBoms = bomRepository.findAll();
        if (existingBoms != null) {
            existingBoms.forEach(existing -> graph.put(existing.getBomNo(), existing));
        }
        graph.put(bom.getBomNo(), bom);
        if (containsCycle(bom.getBomNo(), graph, new HashSet<>(), new HashSet<>())) {
            throw new IllegalArgumentException("BOM hierarchy contains a cycle involving " + bom.getBomNo());
        }
    }

    private boolean containsCycle(String bomNo, Map<String, Bom> graph, Set<String> visiting, Set<String> visited) {
        if (!graph.containsKey(bomNo)) return false;
        if (visited.contains(bomNo)) return false;
        if (!visiting.add(bomNo)) return true;
        for (var item : graph.get(bomNo).getItems()) {
            if (item.getSubBomNo() != null && containsCycle(item.getSubBomNo(), graph, visiting, visited)) return true;
        }
        visiting.remove(bomNo);
        visited.add(bomNo);
        return false;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
