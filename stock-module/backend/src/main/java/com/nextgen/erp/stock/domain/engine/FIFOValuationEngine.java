package com.nextgen.erp.stock.domain.engine;

import com.nextgen.erp.stock.domain.exception.InsufficientStockException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Component
public class FIFOValuationEngine {

    public ValuationResult calculate(List<FifoQueueElement> currentQueue, BigDecimal qtyChange, BigDecimal incomingRate) {
        List<FifoQueueElement> queue = currentQueue != null ? new ArrayList<>(currentQueue) : new ArrayList<>();
        BigDecimal stockValueDiff = BigDecimal.ZERO;

        if (qtyChange.compareTo(BigDecimal.ZERO) > 0) {
            // Inward stock movement
            BigDecimal rate = incomingRate != null ? incomingRate : BigDecimal.ZERO;
            queue.add(new FifoQueueElement(qtyChange, rate));
            stockValueDiff = qtyChange.multiply(rate);
        } else if (qtyChange.compareTo(BigDecimal.ZERO) < 0) {
            // Outward stock movement
            BigDecimal qtyToConsume = qtyChange.abs();
            BigDecimal consumedCost = BigDecimal.ZERO;

            while (qtyToConsume.compareTo(BigDecimal.ZERO) > 0) {
                if (queue.isEmpty()) {
                    // Fallback to incomingRate if queue is empty
                    BigDecimal fallbackRate = incomingRate != null ? incomingRate : BigDecimal.ZERO;
                    consumedCost = consumedCost.add(qtyToConsume.multiply(fallbackRate));
                    qtyToConsume = BigDecimal.ZERO;
                    break;
                }

                FifoQueueElement head = queue.getFirst();
                if (head.getQty().compareTo(qtyToConsume) <= 0) {
                    consumedCost = consumedCost.add(head.getQty().multiply(head.getRate()));
                    qtyToConsume = qtyToConsume.subtract(head.getQty());
                    queue.removeFirst();
                } else {
                    consumedCost = consumedCost.add(qtyToConsume.multiply(head.getRate()));
                    head.setQty(head.getQty().subtract(qtyToConsume));
                    qtyToConsume = BigDecimal.ZERO;
                }
            }
            stockValueDiff = consumedCost.negate();
        }

        // Calculate total remaining qty and total stock value
        BigDecimal totalRemainingQty = BigDecimal.ZERO;
        BigDecimal totalStockValue = BigDecimal.ZERO;

        for (FifoQueueElement el : queue) {
            totalRemainingQty = totalRemainingQty.add(el.getQty());
            totalStockValue = totalStockValue.add(el.getQty().multiply(el.getRate()));
        }

        BigDecimal valuationRate = BigDecimal.ZERO;
        if (totalRemainingQty.compareTo(BigDecimal.ZERO) > 0) {
            valuationRate = totalStockValue.divide(totalRemainingQty, 4, RoundingMode.HALF_UP);
        }

        return ValuationResult.builder()
                .valuationRate(valuationRate)
                .stockValue(totalStockValue)
                .stockValueDifference(stockValueDiff)
                .updatedQueue(queue)
                .build();
    }
}
