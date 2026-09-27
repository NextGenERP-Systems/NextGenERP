package com.nextgen.erp.stock.application.dto;

import com.nextgen.erp.stock.domain.model.InspectionType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QualityInspectionCreateRequest {
    @NotNull
    private InspectionType inspectionType;

    @NotNull
    private String referenceType; // 'Purchase Receipt', 'Delivery Note', 'Stock Entry'

    @NotNull
    private String referenceId;

    @NotNull
    private String itemId;

    @Builder.Default
    private BigDecimal sampleSize = BigDecimal.ONE;

    private LocalDate inspectionDate;
    private String inspector;
    private String remarks;

    @NotEmpty
    private List<ReadingRequest> readings;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReadingRequest {
        @NotNull
        private String parameterName;
        private String specification;
        private BigDecimal minValue;
        private BigDecimal maxValue;
        @NotNull
        private BigDecimal readingValue;
    }
}
