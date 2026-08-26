package com.nextgen.erp.sales.domain.engine;

import com.nextgen.erp.sales.domain.model.SalesTaxAndCharge;
import com.nextgen.erp.sales.domain.model.TaxChargeType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TaxCalculationEngineTest {

    private TaxCalculationEngine taxCalculationEngine;

    @BeforeEach
    void setUp() {
        taxCalculationEngine = new TaxCalculationEngine();
    }

    @Test
    @DisplayName("Should compute On Net Total and Compound taxes accurately matching ERPNext")
    void testCalculateTaxesAdditiveAndCompound() {
        // Net Total = $10,000.00
        BigDecimal netTotal = new BigDecimal("10000.00");
        BigDecimal conversionRate = BigDecimal.ONE;

        // Row 1: State Tax 6.25% On Net Total = $625.00
        SalesTaxAndCharge tax1 = SalesTaxAndCharge.builder()
                .chargeType(TaxChargeType.ON_NET_TOTAL)
                .rate(new BigDecimal("6.2500"))
                .accountHead("State Sales Tax")
                .build();

        // Row 2: Fixed Actual Surcharge = $50.00
        SalesTaxAndCharge tax2 = SalesTaxAndCharge.builder()
                .chargeType(TaxChargeType.ACTUAL)
                .rate(new BigDecimal("50.0000"))
                .accountHead("Freight / Surcharge")
                .build();

        // Row 3: Compound 2.0% on Previous Row Total ($10,675.00) = $213.50
        SalesTaxAndCharge tax3 = SalesTaxAndCharge.builder()
                .chargeType(TaxChargeType.ON_PREVIOUS_ROW_TOTAL)
                .rowId(2)
                .rate(new BigDecimal("2.0000"))
                .accountHead("Environmental Cess")
                .build();

        TaxCalculationEngine.TaxCalculationResult result = taxCalculationEngine.calculateTaxes(
                netTotal,
                conversionRate,
                List.of(tax1, tax2, tax3)
        );

        // Tax1: 625.00, Cumulative: 10,625.00
        assertEquals(new BigDecimal("625.00"), result.calculatedTaxes().get(0).getTaxAmount());
        assertEquals(new BigDecimal("10625.00"), result.calculatedTaxes().get(0).getTotal());

        // Tax2: 50.00, Cumulative: 10,675.00
        assertEquals(new BigDecimal("50.00"), result.calculatedTaxes().get(1).getTaxAmount());
        assertEquals(new BigDecimal("10675.00"), result.calculatedTaxes().get(1).getTotal());

        // Tax3: 2% of 10,675 = 213.50, Cumulative: 10,888.50
        assertEquals(new BigDecimal("213.50"), result.calculatedTaxes().get(2).getTaxAmount());
        assertEquals(new BigDecimal("10888.50"), result.calculatedTaxes().get(2).getTotal());

        assertEquals(new BigDecimal("888.50"), result.totalTaxesAndCharges());
        assertEquals(new BigDecimal("10888.50"), result.grandTotal());
    }
}
