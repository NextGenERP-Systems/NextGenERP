package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.SalesTeamMemberDto;
import com.nextgen.erp.sales.application.dto.SalesTeamSaveRequest;
import com.nextgen.erp.sales.domain.exception.BusinessValidationException;
import com.nextgen.erp.sales.domain.exception.ResourceNotFoundException;
import com.nextgen.erp.sales.domain.model.SalesOrder;
import com.nextgen.erp.sales.domain.model.SalesPerson;
import com.nextgen.erp.sales.domain.model.SalesTeamMember;
import com.nextgen.erp.sales.infrastructure.repository.SalesOrderRepository;
import com.nextgen.erp.sales.infrastructure.repository.SalesPersonRepository;
import com.nextgen.erp.sales.infrastructure.repository.SalesTeamMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalesTeamService {

    private final SalesTeamMemberRepository teamMemberRepository;
    private final SalesPersonRepository salesPersonRepository;
    private final SalesOrderRepository salesOrderRepository;

    @Transactional(readOnly = true)
    public List<SalesTeamMemberDto> getTeamForVoucher(String voucherType, UUID voucherId) {
        List<SalesTeamMember> members = teamMemberRepository.findByVoucherTypeAndVoucherIdOrderByAllocatedPercentageDesc(voucherType, voucherId);

        // If no team members exist yet and it's a Sales Order, seed with 100% allocation for default rep if available
        if (members.isEmpty() && "SALES_ORDER".equalsIgnoreCase(voucherType)) {
            salesOrderRepository.findById(voucherId).ifPresent(order -> {
                SalesPerson defaultRep = salesPersonRepository.findAll().stream()
                        .findFirst()
                        .orElse(null);

                if (defaultRep != null) {
                    BigDecimal grandTotal = order.getGrandTotal() != null ? order.getGrandTotal() : BigDecimal.ZERO;
                    BigDecimal commRate = defaultRep.getCommissionRate() != null ? defaultRep.getCommissionRate() : new BigDecimal("5.00");
                    BigDecimal incentives = grandTotal.multiply(commRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

                    SalesTeamMember initial = SalesTeamMember.builder()
                            .voucherType("SALES_ORDER")
                            .voucherId(order.getId())
                            .salesPerson(defaultRep)
                            .salesPersonName(defaultRep.getSalesPersonName())
                            .allocatedPercentage(new BigDecimal("100.00"))
                            .allocatedAmount(grandTotal)
                            .commissionRate(commRate)
                            .incentives(incentives)
                            .build();

                    members.add(teamMemberRepository.save(initial));
                }
            });
        }

        return members.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public List<SalesTeamMemberDto> saveTeamForVoucher(String voucherType, UUID voucherId, SalesTeamSaveRequest request) {
        if (request.getMembers() == null || request.getMembers().isEmpty()) {
            throw new BusinessValidationException("Sales team must contain at least one sales representative.");
        }

        BigDecimal totalPercentage = request.getMembers().stream()
                .map(SalesTeamSaveRequest.MemberEntry::getAllocatedPercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalPercentage.compareTo(new BigDecimal("100.00")) != 0) {
            throw new BusinessValidationException("Sum of allocated contribution percentages must equal exactly 100.00%. Current sum: " + totalPercentage + "%");
        }

        BigDecimal grandTotal = request.getGrandTotal();
        if (grandTotal == null || grandTotal.compareTo(BigDecimal.ZERO) <= 0) {
            if ("SALES_ORDER".equalsIgnoreCase(voucherType)) {
                SalesOrder order = salesOrderRepository.findById(voucherId).orElse(null);
                if (order != null && order.getGrandTotal() != null) {
                    grandTotal = order.getGrandTotal();
                }
            }
        }
        if (grandTotal == null) grandTotal = BigDecimal.ZERO;

        teamMemberRepository.deleteByVoucherTypeAndVoucherId(voucherType, voucherId);

        List<SalesTeamMember> savedMembers = new ArrayList<>();
        BigDecimal allocatedTotalSum = BigDecimal.ZERO;

        for (int i = 0; i < request.getMembers().size(); i++) {
            SalesTeamSaveRequest.MemberEntry entry = request.getMembers().get(i);
            SalesPerson person = salesPersonRepository.findById(entry.getSalesPersonId())
                    .orElseThrow(() -> new ResourceNotFoundException("SalesPerson", entry.getSalesPersonId()));

            BigDecimal allocatedAmt;
            if (i == request.getMembers().size() - 1) {
                allocatedAmt = grandTotal.subtract(allocatedTotalSum);
            } else {
                allocatedAmt = grandTotal.multiply(entry.getAllocatedPercentage()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                allocatedTotalSum = allocatedTotalSum.add(allocatedAmt);
            }

            BigDecimal commRate = entry.getCommissionRate() != null
                    ? entry.getCommissionRate()
                    : (person.getCommissionRate() != null ? person.getCommissionRate() : BigDecimal.ZERO);

            BigDecimal incentives = allocatedAmt.multiply(commRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

            SalesTeamMember member = SalesTeamMember.builder()
                    .voucherType(voucherType.toUpperCase())
                    .voucherId(voucherId)
                    .salesPerson(person)
                    .salesPersonName(person.getSalesPersonName())
                    .allocatedPercentage(entry.getAllocatedPercentage())
                    .allocatedAmount(allocatedAmt)
                    .commissionRate(commRate)
                    .incentives(incentives)
                    .build();

            savedMembers.add(teamMemberRepository.save(member));
        }

        log.info("Saved {} sales team allocations for {} ID {}", savedMembers.size(), voucherType, voucherId);
        return savedMembers.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private SalesTeamMemberDto mapToDto(SalesTeamMember m) {
        return SalesTeamMemberDto.builder()
                .id(m.getId())
                .voucherType(m.getVoucherType())
                .voucherId(m.getVoucherId())
                .salesPersonId(m.getSalesPerson() != null ? m.getSalesPerson().getId() : null)
                .salesPersonName(m.getSalesPersonName())
                .allocatedPercentage(m.getAllocatedPercentage())
                .allocatedAmount(m.getAllocatedAmount())
                .commissionRate(m.getCommissionRate())
                .incentives(m.getIncentives())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
