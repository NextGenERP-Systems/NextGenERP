package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.*;
import com.nextgen.erp.sales.domain.model.*;
import com.nextgen.erp.sales.infrastructure.repository.*;
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
public class SalesTargetService {

    private final SalesTargetRepository salesTargetRepository;
    private final SalesPersonRepository salesPersonRepository;
    private final TerritoryRepository territoryRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final SalesTeamMemberRepository salesTeamMemberRepository;

    @Transactional(readOnly = true)
    public List<SalesTargetDto> getAllTargets(String fiscalYear) {
        String year = (fiscalYear != null && !fiscalYear.isBlank()) ? fiscalYear : "2026";
        List<SalesTarget> list = salesTargetRepository.findByFiscalYear(year);
        if (list.isEmpty()) {
            seedDefaultTargets(year);
            list = salesTargetRepository.findByFiscalYear(year);
        }
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public SalesTargetDto createOrUpdateTarget(SalesTargetCreateRequest request) {
        String year = (request.getFiscalYear() != null && !request.getFiscalYear().isBlank())
                ? request.getFiscalYear()
                : "2026";

        SalesTarget target = salesTargetRepository
                .findByTargetTypeAndTargetRefIdAndFiscalYear(request.getTargetType(), request.getTargetRefId(), year)
                .orElseGet(() -> SalesTarget.builder()
                        .targetType(request.getTargetType())
                        .targetRefId(request.getTargetRefId())
                        .fiscalYear(year)
                        .build());

        target.setTargetRefName(request.getTargetRefName() != null ? request.getTargetRefName() : "Target Reference");
        target.setPeriod(request.getPeriod() != null ? request.getPeriod() : "ANNUAL");
        target.setItemGroupId(request.getItemGroupId());
        target.setItemGroupName(request.getItemGroupName());
        target.setTargetAmount(request.getTargetAmount() != null ? request.getTargetAmount() : BigDecimal.ZERO);
        target.setTargetQty(request.getTargetQty() != null ? request.getTargetQty() : BigDecimal.ZERO);

        SalesTarget saved = salesTargetRepository.save(target);
        log.info("Saved Sales Target for {} '{}' ({}) = {}", target.getTargetType(), target.getTargetRefName(), year, target.getTargetAmount());
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<TargetVarianceReportDto> getSalesPersonTargetVariance(String fiscalYear) {
        String year = (fiscalYear != null && !fiscalYear.isBlank()) ? fiscalYear : "2026";
        List<SalesPerson> reps = salesPersonRepository.findAll();
        List<TargetVarianceReportDto> reports = new ArrayList<>();

        for (SalesPerson rep : reps) {
            BigDecimal targetAmount = salesTargetRepository
                    .findByTargetTypeAndTargetRefIdAndFiscalYear(TargetType.SALES_PERSON, rep.getId(), year)
                    .map(SalesTarget::getTargetAmount)
                    .orElse(rep.getTargetAmount() != null ? rep.getTargetAmount() : new BigDecimal("500000.00"));

            // Calculate actual sales achieved from team allocations or order bookings
            List<SalesTeamMember> allocations = salesTeamMemberRepository.findBySalesPersonId(rep.getId());
            BigDecimal achievedAmount = allocations.stream()
                    .map(SalesTeamMember::getAllocatedAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (achievedAmount.compareTo(BigDecimal.ZERO) == 0 && rep.getAllocatedAmount() != null && rep.getAllocatedAmount().compareTo(BigDecimal.ZERO) > 0) {
                achievedAmount = rep.getAllocatedAmount();
            }

            BigDecimal variance = achievedAmount.subtract(targetAmount);
            BigDecimal percentage = targetAmount.compareTo(BigDecimal.ZERO) > 0
                    ? achievedAmount.multiply(new BigDecimal("100")).divide(targetAmount, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            String pacingStatus;
            if (percentage.compareTo(new BigDecimal("100.00")) >= 0) {
                pacingStatus = "EXCEEDED";
            } else if (percentage.compareTo(new BigDecimal("75.00")) >= 0) {
                pacingStatus = "ON_TRACK";
            } else if (percentage.compareTo(new BigDecimal("50.00")) >= 0) {
                pacingStatus = "AT_RISK";
            } else {
                pacingStatus = "BEHIND";
            }

            reports.add(TargetVarianceReportDto.builder()
                    .targetRefId(rep.getId())
                    .targetRefName(rep.getSalesPersonName())
                    .targetType(TargetType.SALES_PERSON)
                    .fiscalYear(year)
                    .period("ANNUAL")
                    .targetAmount(targetAmount)
                    .achievedAmount(achievedAmount)
                    .varianceAmount(variance)
                    .percentageAchieved(percentage)
                    .pacingStatus(pacingStatus)
                    .totalDealsBooked(allocations.size())
                    .build());
        }

        return reports;
    }

    @Transactional(readOnly = true)
    public List<TargetVarianceReportDto> getTerritoryTargetVariance(String fiscalYear) {
        String year = (fiscalYear != null && !fiscalYear.isBlank()) ? fiscalYear : "2026";
        List<Territory> territories = territoryRepository.findAll();
        List<SalesOrder> allOrders = salesOrderRepository.findAll();
        List<TargetVarianceReportDto> reports = new ArrayList<>();

        for (Territory territory : territories) {
            BigDecimal targetAmount = salesTargetRepository
                    .findByTargetTypeAndTargetRefIdAndFiscalYear(TargetType.TERRITORY, territory.getId(), year)
                    .map(SalesTarget::getTargetAmount)
                    .orElse(new BigDecimal("1000000.00"));

            // Calculate achieved from sales orders matching customer's territory
            BigDecimal achieved = allOrders.stream()
                    .filter(o -> o.getCustomer() != null && o.getCustomer().getTerritory() != null &&
                            territory.getId().equals(o.getCustomer().getTerritory().getId()))
                    .map(SalesOrder::getGrandTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal variance = achieved.subtract(targetAmount);
            BigDecimal percentage = targetAmount.compareTo(BigDecimal.ZERO) > 0
                    ? achieved.multiply(new BigDecimal("100")).divide(targetAmount, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            String pacingStatus;
            if (percentage.compareTo(new BigDecimal("100.00")) >= 0) {
                pacingStatus = "EXCEEDED";
            } else if (percentage.compareTo(new BigDecimal("75.00")) >= 0) {
                pacingStatus = "ON_TRACK";
            } else if (percentage.compareTo(new BigDecimal("50.00")) >= 0) {
                pacingStatus = "AT_RISK";
            } else {
                pacingStatus = "BEHIND";
            }

            reports.add(TargetVarianceReportDto.builder()
                    .targetRefId(territory.getId())
                    .targetRefName(territory.getName())
                    .targetType(TargetType.TERRITORY)
                    .fiscalYear(year)
                    .period("ANNUAL")
                    .targetAmount(targetAmount)
                    .achievedAmount(achieved)
                    .varianceAmount(variance)
                    .percentageAchieved(percentage)
                    .pacingStatus(pacingStatus)
                    .totalDealsBooked((int) allOrders.stream().filter(o -> o.getCustomer() != null && o.getCustomer().getTerritory() != null && territory.getId().equals(o.getCustomer().getTerritory().getId())).count())
                    .build());
        }

        return reports;
    }

    @Transactional
    public void seedDefaultTargets(String fiscalYear) {
        if (salesTargetRepository.count() > 0) return;

        List<SalesPerson> reps = salesPersonRepository.findAll();
        for (SalesPerson rep : reps) {
            salesTargetRepository.save(SalesTarget.builder()
                    .targetType(TargetType.SALES_PERSON)
                    .targetRefId(rep.getId())
                    .targetRefName(rep.getSalesPersonName())
                    .fiscalYear(fiscalYear)
                    .period("ANNUAL")
                    .targetAmount(rep.getTargetAmount() != null ? rep.getTargetAmount() : new BigDecimal("500000.00"))
                    .targetQty(new BigDecimal("50.00"))
                    .build());
        }

        List<Territory> territories = territoryRepository.findAll();
        for (Territory t : territories) {
            salesTargetRepository.save(SalesTarget.builder()
                    .targetType(TargetType.TERRITORY)
                    .targetRefId(t.getId())
                    .targetRefName(t.getName())
                    .fiscalYear(fiscalYear)
                    .period("ANNUAL")
                    .targetAmount(new BigDecimal("1200000.00"))
                    .targetQty(new BigDecimal("120.00"))
                    .build());
        }

        log.info("Seeded default Sales Targets for fiscal year {}", fiscalYear);
    }

    private SalesTargetDto mapToDto(SalesTarget t) {
        return SalesTargetDto.builder()
                .id(t.getId())
                .targetType(t.getTargetType())
                .targetRefId(t.getTargetRefId())
                .targetRefName(t.getTargetRefName())
                .fiscalYear(t.getFiscalYear())
                .period(t.getPeriod())
                .itemGroupId(t.getItemGroupId())
                .itemGroupName(t.getItemGroupName())
                .targetAmount(t.getTargetAmount())
                .targetQty(t.getTargetQty())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
