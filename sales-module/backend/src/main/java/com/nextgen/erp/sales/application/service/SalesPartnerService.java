package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.SalesPartnerCreateRequest;
import com.nextgen.erp.sales.application.dto.SalesPartnerDto;
import com.nextgen.erp.sales.application.dto.SalesPartnerPayoutCreateRequest;
import com.nextgen.erp.sales.application.dto.SalesPartnerPayoutDto;
import com.nextgen.erp.sales.domain.exception.ResourceNotFoundException;
import com.nextgen.erp.sales.domain.model.SalesPartner;
import com.nextgen.erp.sales.domain.model.SalesPartnerPayout;
import com.nextgen.erp.sales.infrastructure.repository.SalesPartnerPayoutRepository;
import com.nextgen.erp.sales.infrastructure.repository.SalesPartnerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalesPartnerService {

    private final SalesPartnerRepository salesPartnerRepository;
    private final SalesPartnerPayoutRepository salesPartnerPayoutRepository;

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
                .totalCommissionPaid(BigDecimal.ZERO)
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

    @Transactional
    public void allocateCommission(UUID partnerId, BigDecimal allocatedAmount, BigDecimal commissionAmount) {
        if (partnerId == null) return;
        salesPartnerRepository.findById(partnerId).ifPresent(sp -> {
            sp.allocateCommission(allocatedAmount, commissionAmount);
            salesPartnerRepository.save(sp);
            log.info("Allocated commission {} on sales {} for partner {}", commissionAmount, allocatedAmount, sp.getPartnerName());
        });
    }

    @Transactional
    public void revertCommission(UUID partnerId, BigDecimal allocatedAmount, BigDecimal commissionAmount) {
        if (partnerId == null) return;
        salesPartnerRepository.findById(partnerId).ifPresent(sp -> {
            sp.revertCommission(allocatedAmount, commissionAmount);
            salesPartnerRepository.save(sp);
            log.info("Reverted commission {} on sales {} for partner {}", commissionAmount, allocatedAmount, sp.getPartnerName());
        });
    }

    @Transactional
    public SalesPartnerPayoutDto createPayout(SalesPartnerPayoutCreateRequest request) {
        SalesPartner sp = salesPartnerRepository.findById(request.getSalesPartnerId())
                .orElseThrow(() -> new ResourceNotFoundException("SalesPartner", request.getSalesPartnerId()));

        String payoutNumber = "PAYOUT-" + System.currentTimeMillis() % 1000000;
        SalesPartnerPayout payout = SalesPartnerPayout.builder()
                .payoutNumber(payoutNumber)
                .salesPartnerId(sp.getId())
                .salesPartnerName(sp.getPartnerName())
                .postingDate(request.getPostingDate() != null ? request.getPostingDate() : LocalDate.now())
                .amount(request.getAmount())
                .referenceNote(request.getReferenceNote())
                .paymentMode(request.getPaymentMode() != null ? request.getPaymentMode() : "Bank Transfer")
                .createdAt(OffsetDateTime.now())
                .build();

        SalesPartnerPayout saved = salesPartnerPayoutRepository.save(payout);
        sp.recordPayout(request.getAmount());
        salesPartnerRepository.save(sp);

        log.info("Recorded payout {} for partner {}", request.getAmount(), sp.getPartnerName());
        return mapPayoutToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SalesPartnerPayoutDto> getPayoutsByPartner(UUID partnerId) {
        return salesPartnerPayoutRepository.findBySalesPartnerIdOrderByCreatedAtDesc(partnerId).stream()
                .map(this::mapPayoutToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SalesPartnerPayoutDto> getAllPayouts() {
        return salesPartnerPayoutRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapPayoutToDto)
                .collect(Collectors.toList());
    }

    public SalesPartnerDto mapToDto(SalesPartner sp) {
        BigDecimal earned = sp.getTotalCommissionEarned() != null ? sp.getTotalCommissionEarned() : BigDecimal.ZERO;
        BigDecimal paid = sp.getTotalCommissionPaid() != null ? sp.getTotalCommissionPaid() : BigDecimal.ZERO;
        BigDecimal outstanding = earned.subtract(paid);
        if (outstanding.compareTo(BigDecimal.ZERO) < 0) {
            outstanding = BigDecimal.ZERO;
        }

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
                .totalAllocatedAmount(sp.getTotalAllocatedAmount() != null ? sp.getTotalAllocatedAmount() : BigDecimal.ZERO)
                .totalCommissionEarned(earned)
                .totalCommissionPaid(paid)
                .balanceOutstanding(outstanding)
                .disabled(sp.getDisabled())
                .createdAt(sp.getCreatedAt())
                .build();
    }

    public SalesPartnerPayoutDto mapPayoutToDto(SalesPartnerPayout p) {
        return SalesPartnerPayoutDto.builder()
                .id(p.getId())
                .payoutNumber(p.getPayoutNumber())
                .salesPartnerId(p.getSalesPartnerId())
                .salesPartnerName(p.getSalesPartnerName())
                .postingDate(p.getPostingDate())
                .amount(p.getAmount())
                .referenceNote(p.getReferenceNote())
                .paymentMode(p.getPaymentMode())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
