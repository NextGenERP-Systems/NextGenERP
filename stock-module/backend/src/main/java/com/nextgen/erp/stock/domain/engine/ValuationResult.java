package com.nextgen.erp.stock.domain.engine;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValuationResult {
    private BigDecimal valuationRate;
    private BigDecimal stockValue;
    private BigDecimal stockValueDifference;
    private List<FifoQueueElement> updatedQueue;
}
