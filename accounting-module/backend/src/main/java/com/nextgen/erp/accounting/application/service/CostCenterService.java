package com.nextgen.erp.accounting.application.service;

import com.nextgen.erp.accounting.domain.model.CostCenter;
import com.nextgen.erp.accounting.infrastructure.repository.CostCenterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CostCenterService {

    private final CostCenterRepository costCenterRepository;

    @Transactional(readOnly = true)
    public List<CostCenter> getAllCostCenters() {
        return costCenterRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<CostCenter> getCostCenterById(UUID id) {
        return costCenterRepository.findById(id);
    }

    @Transactional
    public CostCenter createCostCenter(CostCenter costCenter) {
        if (costCenter.getCostCenterCode() == null || costCenter.getCostCenterCode().isBlank()) {
            costCenter.setCostCenterCode("CC-" + (costCenterRepository.count() + 101));
        }
        return costCenterRepository.save(costCenter);
    }

    @Transactional
    public void deleteCostCenter(UUID id) {
        costCenterRepository.deleteById(id);
    }
}
