package com.nextgen.erp.stock.domain.engine;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FifoQueueElement {
    private BigDecimal qty;
    private BigDecimal rate;
}
