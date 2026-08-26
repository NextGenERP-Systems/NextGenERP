package com.nextgen.erp.sales.domain.engine;

import com.nextgen.erp.sales.domain.model.DiscountApplyOn;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PricingEngineTest {

    private PricingEngine pricingEngine;

    @BeforeEach
    void setUp() {
        pricingEngine = new PricingEngine();
    }

    @Test
    @DisplayName("Should compute item discount % and gross profit correctly")
    void testItemPricingCalculation() {
        // Qty = 5, Price List Rate = $1,000, Discount = 10%, Valuation Rate = $600
        PricingEngine.ItemPricingResult result = pricingEngine.calculateItemPricing(
                new BigDecimal("5.0000"),
                BigDecimal.ONE,
                new BigDecimal("1000.00"),
                new BigDecimal("10.00"),
                BigDecimal.ZERO,
                BigDecimal.ONE,
                new BigDecimal("600.00")
        );

        // Rate after 10% discount = $900.00
        assertEquals(new BigDecimal("900.00"), result.rate());
        assertEquals(new BigDecimal("4500.00"), result.amount());
        assertEquals(new BigDecimal("4500.00"), result.netAmount());
        // Gross Profit = (900 - 600) * 5 = $1,500.00
        assertEquals(new BigDecimal("1500.00"), result.grossProfit());
    }

    @Test
    @DisplayName("Should compute document totals and additional discount correctly")
    void testDocumentTotalsCalculation() {
        // Net Total = $4,500, Tax = $450, Additional Discount = 5% on Grand Total ($4,950)
        PricingEngine.DocumentTotalsResult result = pricingEngine.calculateDocumentTotals(
                new BigDecimal("4500.00"),
                new BigDecimal("450.00"),
                new BigDecimal("5.00"),
                BigDecimal.ZERO,
                DiscountApplyOn.GRAND_TOTAL,
                BigDecimal.ONE
        );

        // Discount: 5% of 4950 = $247.50
        assertEquals(new BigDecimal("247.50"), result.totalDiscount());
        // Grand Total: 4950 - 247.50 = $4702.50
        assertEquals(new BigDecimal("4702.50"), result.grandTotal());
    }
}
