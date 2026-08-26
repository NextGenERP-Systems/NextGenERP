package com.nextgen.erp.sales.domain.engine;

import com.nextgen.erp.sales.domain.exception.BusinessValidationException;
import com.nextgen.erp.sales.domain.model.SalesOrderItem;
import com.nextgen.erp.sales.domain.model.SalesTeamMember;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CommissionEngineTest {

    private CommissionEngine commissionEngine;

    @BeforeEach
    void setUp() {
        commissionEngine = new CommissionEngine();
    }

    @Test
    @DisplayName("Should successfully calculate 100% split across sales team")
    void testCommissionDistributionValidSplit() {
        SalesOrderItem item1 = SalesOrderItem.builder()
                .netAmount(new BigDecimal("10000.00"))
                .grantCommission(true)
                .build();
        SalesOrderItem item2 = SalesOrderItem.builder()
                .netAmount(new BigDecimal("5000.00"))
                .grantCommission(true)
                .build();
        // Total eligible = $15,000.00

        SalesTeamMember member1 = SalesTeamMember.builder()
                .salesPersonName("Alice")
                .allocatedPercentage(new BigDecimal("60.00"))
                .commissionRate(new BigDecimal("5.00"))
                .build();
        SalesTeamMember member2 = SalesTeamMember.builder()
                .salesPersonName("Bob")
                .allocatedPercentage(new BigDecimal("40.00"))
                .commissionRate(new BigDecimal("5.00"))
                .build();

        CommissionEngine.CommissionDistributionResult result = commissionEngine.calculateCommission(
                List.of(item1, item2),
                new BigDecimal("5.00"),
                List.of(member1, member2)
        );

        assertEquals(new BigDecimal("15000.00"), result.amountEligibleForCommission());
        assertEquals(new BigDecimal("750.00"), result.totalCommission());

        // Alice: 60% of 15,000 = $9,000. Incentive 5% = $450.00
        assertEquals(new BigDecimal("9000.00"), member1.getAllocatedAmount());
        assertEquals(new BigDecimal("450.00"), member1.getIncentives());

        // Bob: 40% of 15,000 = $6,000. Incentive 5% = $300.00
        assertEquals(new BigDecimal("6000.00"), member2.getAllocatedAmount());
        assertEquals(new BigDecimal("300.00"), member2.getIncentives());
    }

    @Test
    @DisplayName("Should throw BusinessValidationException when sales team allocated percentage does not sum to 100%")
    void testCommissionDistributionInvalidSplit() {
        SalesOrderItem item = SalesOrderItem.builder()
                .netAmount(new BigDecimal("10000.00"))
                .grantCommission(true)
                .build();

        SalesTeamMember member1 = SalesTeamMember.builder()
                .salesPersonName("Alice")
                .allocatedPercentage(new BigDecimal("50.00"))
                .build();
        SalesTeamMember member2 = SalesTeamMember.builder()
                .salesPersonName("Bob")
                .allocatedPercentage(new BigDecimal("30.00")) // Sum = 80% != 100%
                .build();

        assertThrows(BusinessValidationException.class, () ->
                commissionEngine.calculateCommission(List.of(item), new BigDecimal("5.00"), List.of(member1, member2))
        );
    }
}
