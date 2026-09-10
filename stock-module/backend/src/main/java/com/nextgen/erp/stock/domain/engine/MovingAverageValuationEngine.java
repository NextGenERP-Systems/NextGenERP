package com.nextgen.erp.stock.domain.engine;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;

@Component
public class MovingAverageValuationEngine {

    public ValuationResult calculate(BigDecimal currentQty, BigDecimal currentRate, BigDecimal qtyChange, BigDecimal incomingRate) {
        BigDecimal oldQty = currentQty != null ? currentQty : BigDecimal.ZERO;
        BigDecimal oldRate = currentRate != null ? currentRate : BigDecimal.ZERO;
        BigDecimal inRate = incomingRate != null ? incomingRate : oldRate;

        BigDecimal newQty = oldQty.add(qtyChange);
        BigDecimal newValuationRate = oldRate;
        BigDecimal stockValDiff;
        BigDecimal totalStockVal;

        if (qtyChange.compareTo(BigDecimal.ZERO) > 0) {
            // Inward receipt
            BigDecimal incomingValue = qtyChange.multiply(inRate);
            BigDecimal currentTotalValue = oldQty.multiply(oldRate);
            totalStockVal = currentTotalValue.add(incomingValue);

            if (newQty.compareTo(BigDecimal.ZERO) > 0) {
                newValuationRate = totalStockVal.divide(newQty, 4, RoundingMode.HALF_UP);
            }
            stockValDiff = incomingValue;
        } else {
            // Outward issue
            stockValDiff = qtyChange.multiply(oldRate); // negative value
            totalStockVal = newQty.multiply(oldRate);
            newValuationRate = oldRate;
        }

        return ValuationResult.builder()
                .valuationRate(newValuationRate)
                .stockValue(totalStockVal)
                .stockValueDifference(stockValDiff)
                .updatedQueue(Collections.emptyList())
                .build();
    }
}
