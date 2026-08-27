package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.SalesPersonCreateRequest;
import com.nextgen.erp.sales.application.dto.SalesPersonDto;
import com.nextgen.erp.sales.domain.exception.ResourceNotFoundException;
import com.nextgen.erp.sales.domain.model.SalesPerson;
import com.nextgen.erp.sales.infrastructure.repository.SalesPersonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalesPersonService {

    private final SalesPersonRepository salesPersonRepository;

    @Transactional(readOnly = true)
    public List<SalesPersonDto> getAllSalesPersons() {
        return salesPersonRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalesPersonDto getSalesPersonById(UUID id) {
        SalesPerson sp = salesPersonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesPerson", id));
        return mapToDto(sp);
    }

    @Transactional
    public SalesPersonDto createSalesPerson(SalesPersonCreateRequest request) {
        SalesPerson sp = SalesPerson.builder()
                .salesPersonName(request.getSalesPersonName())
                .employeeId(request.getEmployeeId())
                .email(request.getEmail())
                .phone(request.getPhone())
                .parentSalesPerson(request.getParentSalesPerson())
                .commissionRate(request.getCommissionRate() != null ? request.getCommissionRate() : new BigDecimal("4.50"))
                .targetAmount(request.getTargetAmount() != null ? request.getTargetAmount() : new BigDecimal("500000.00"))
                .allocatedAmount(BigDecimal.ZERO)
                .incentivesEarned(BigDecimal.ZERO)
                .disabled(false)
                .build();

        SalesPerson saved = salesPersonRepository.save(sp);
        log.info("Created Sales Person: {}", saved.getSalesPersonName());
        return mapToDto(saved);
    }

    @Transactional
    public SalesPersonDto toggleStatus(UUID id) {
        SalesPerson sp = salesPersonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesPerson", id));
        sp.setDisabled(!Boolean.TRUE.equals(sp.getDisabled()));
        SalesPerson saved = salesPersonRepository.save(sp);
        return mapToDto(saved);
    }

    public SalesPersonDto mapToDto(SalesPerson sp) {
        return SalesPersonDto.builder()
                .id(sp.getId())
                .salesPersonName(sp.getSalesPersonName())
                .employeeId(sp.getEmployeeId())
                .email(sp.getEmail())
                .phone(sp.getPhone())
                .parentSalesPerson(sp.getParentSalesPerson())
                .commissionRate(sp.getCommissionRate())
                .targetAmount(sp.getTargetAmount())
                .allocatedAmount(sp.getAllocatedAmount())
                .incentivesEarned(sp.getIncentivesEarned())
                .disabled(sp.getDisabled())
                .createdAt(sp.getCreatedAt())
                .build();
    }
}
