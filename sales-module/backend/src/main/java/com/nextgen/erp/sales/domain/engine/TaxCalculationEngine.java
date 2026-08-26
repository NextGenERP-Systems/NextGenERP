package com.nextgen.erp.sales.domain.engine;

import com.nextgen.erp.sales.domain.model.SalesTaxAndCharge;
import com.nextgen.erp.sales.domain.model.TaxChargeType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Component
public class TaxCalculationEngine {

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");

    public record TaxCalculationResult(
            List<SalesTaxAndCharge> calculatedTaxes,
            BigDecimal totalTaxesAndCharges,
            BigDecimal grandTotal
    ) {}

    public TaxCalculationResult calculateTaxes(
            BigDecimal netTotal,
            BigDecimal conversionRate,
            List<SalesTaxAndCharge> taxes
    ) {
        if (netTotal == null) netTotal = BigDecimal.ZERO;
        if (conversionRate == null || conversionRate.compareTo(BigDecimal.ZERO) == 0) conversionRate = BigDecimal.ONE;
        if (taxes == null || taxes.isEmpty()) {
            return new TaxCalculationResult(new ArrayList<>(), BigDecimal.ZERO, netTotal);
        }

        List<SalesTaxAndCharge> calculatedList = new ArrayList<>();
        BigDecimal cumulativeTotal = netTotal;
        BigDecimal totalTaxes = BigDecimal.ZERO;

        for (int i = 0; i < taxes.size(); i++) {
            SalesTaxAndCharge tax = taxes.get(i);
            tax.setIdx(i + 1);

            BigDecimal taxAmount = BigDecimal.ZERO;
            TaxChargeType chargeType = tax.getChargeType() != null ? tax.getChargeType() : TaxChargeType.ON_NET_TOTAL;

            switch (chargeType) {
                case ON_NET_TOTAL -> {
                    BigDecimal rate = tax.getRate() != null ? tax.getRate() : BigDecimal.ZERO;
                    taxAmount = netTotal.multiply(rate).divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
                }
                case ACTUAL -> {
                    taxAmount = tax.getRate() != null ? tax.getRate().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
                }
                case ON_PREVIOUS_ROW_TOTAL -> {
                    BigDecimal previousTotal = netTotal;
                    if (tax.getRowId() != null && tax.getRowId() > 0 && tax.getRowId() <= calculatedList.size()) {
                        previousTotal = calculatedList.get(tax.getRowId() - 1).getTotal();
                    } else if (!calculatedList.isEmpty()) {
                        previousTotal = calculatedList.get(calculatedList.size() - 1).getTotal();
                    }
                    BigDecimal rate = tax.getRate() != null ? tax.getRate() : BigDecimal.ZERO;
                    taxAmount = previousTotal.multiply(rate).divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
                }
            }

            cumulativeTotal = cumulativeTotal.add(taxAmount);
            totalTaxes = totalTaxes.add(taxAmount);

            tax.setTaxAmount(taxAmount);
            tax.setTotal(cumulativeTotal);
            tax.setBaseTaxAmount(taxAmount.multiply(conversionRate).setScale(2, RoundingMode.HALF_UP));
            tax.setBaseTotal(cumulativeTotal.multiply(conversionRate).setScale(2, RoundingMode.HALF_UP));

            calculatedList.add(tax);
        }

        return new TaxCalculationResult(
                calculatedList,
                totalTaxes.setScale(2, RoundingMode.HALF_UP),
                cumulativeTotal.setScale(2, RoundingMode.HALF_UP)
        );
    }
}
