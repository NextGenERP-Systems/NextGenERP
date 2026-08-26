package com.nextgen.erp.sales.domain.engine;

import com.nextgen.erp.sales.domain.exception.BusinessValidationException;
import com.nextgen.erp.sales.domain.model.SalesOrderItem;
import com.nextgen.erp.sales.domain.model.SalesTeamMember;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Component
public class CommissionEngine {

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100.00");

    public record CommissionDistributionResult(
            BigDecimal amountEligibleForCommission,
            BigDecimal totalCommission,
            List<SalesTeamMember> calculatedTeam
    ) {}

    public CommissionDistributionResult calculateCommission(
            List<SalesOrderItem> items,
            BigDecimal headerCommissionRate,
            List<SalesTeamMember> salesTeam
    ) {
        if (headerCommissionRate == null) headerCommissionRate = BigDecimal.ZERO;
        if (items == null) items = new ArrayList<>();
        if (salesTeam == null) salesTeam = new ArrayList<>();

        // 1. Calculate eligible base net amount
        BigDecimal eligibleAmount = items.stream()
                .filter(item -> Boolean.TRUE.equals(item.getGrantCommission()))
                .map(item -> item.getNetAmount() != null ? item.getNetAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalCommission = eligibleAmount.multiply(headerCommissionRate)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        // 2. Validate sales team allocated percentages if team is assigned
        if (!salesTeam.isEmpty()) {
            BigDecimal totalAllocatedPercentage = salesTeam.stream()
                    .map(member -> member.getAllocatedPercentage() != null ? member.getAllocatedPercentage() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalAllocatedPercentage.setScale(2, RoundingMode.HALF_UP).compareTo(ONE_HUNDRED) != 0) {
                throw new BusinessValidationException(String.format(
                        "Total allocated percentage for Sales Team must be exactly 100%%. Current total: %s%%",
                        totalAllocatedPercentage
                ));
            }

            for (SalesTeamMember member : salesTeam) {
                BigDecimal memberShare = eligibleAmount.multiply(member.getAllocatedPercentage())
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                member.setAllocatedAmount(memberShare);

                BigDecimal rate = member.getCommissionRate() != null ? member.getCommissionRate() : headerCommissionRate;
                BigDecimal incentives = memberShare.multiply(rate)
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                member.setIncentives(incentives);
            }
        }

        return new CommissionDistributionResult(eligibleAmount, totalCommission, salesTeam);
    }
}
