package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.SalesPartnerCreateRequest;
import com.nextgen.erp.sales.application.dto.SalesPartnerDto;
import com.nextgen.erp.sales.domain.exception.ResourceNotFoundException;
import com.nextgen.erp.sales.domain.model.SalesPartner;
import com.nextgen.erp.sales.infrastructure.repository.SalesPartnerRepository;
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
public class SalesPartnerService {

    private final SalesPartnerRepository salesPartnerRepository;

    @Transactional(readOnly = true)
    public List<SalesPartnerDto> getAllSalesPartners() {
        return salesPartnerRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalesPartnerDto getSalesPartnerById(UUID id) {
        SalesPartner sp = salesPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesPartner", id));
        return mapToDto(sp);
    }

    @Transactional
    public SalesPartnerDto createSalesPartner(SalesPartnerCreateRequest request) {
        SalesPartner sp = SalesPartner.builder()
                .partnerName(request.getPartnerName())
                .partnerType(request.getPartnerType() != null ? request.getPartnerType() : "Channel Partner")
                .commissionRate(request.getCommissionRate() != null ? request.getCommissionRate() : new BigDecimal("5.00"))
                .currency(request.getCurrency() != null ? request.getCurrency() : "INR")
                .contactPerson(request.getContactPerson())
                .email(request.getEmail())
                .phone(request.getPhone())
                .territory(request.getTerritory() != null ? request.getTerritory() : "Global")
                .totalAllocatedAmount(BigDecimal.ZERO)
                .totalCommissionEarned(BigDecimal.ZERO)
                .disabled(false)
                .build();

        SalesPartner saved = salesPartnerRepository.save(sp);
        log.info("Created Sales Partner: {}", saved.getPartnerName());
        return mapToDto(saved);
    }

    @Transactional
    public SalesPartnerDto toggleStatus(UUID id) {
        SalesPartner sp = salesPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesPartner", id));
        sp.setDisabled(!Boolean.TRUE.equals(sp.getDisabled()));
        SalesPartner saved = salesPartnerRepository.save(sp);
        return mapToDto(saved);
    }

    public SalesPartnerDto mapToDto(SalesPartner sp) {
        return SalesPartnerDto.builder()
                .id(sp.getId())
                .partnerName(sp.getPartnerName())
                .partnerType(sp.getPartnerType())
                .commissionRate(sp.getCommissionRate())
                .currency(sp.getCurrency())
                .contactPerson(sp.getContactPerson())
                .email(sp.getEmail())
                .phone(sp.getPhone())
                .territory(sp.getTerritory())
                .totalAllocatedAmount(sp.getTotalAllocatedAmount())
                .totalCommissionEarned(sp.getTotalCommissionEarned())
                .disabled(sp.getDisabled())
                .createdAt(sp.getCreatedAt())
                .build();
    }
}
