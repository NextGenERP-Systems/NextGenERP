package com.nextgen.erp.sales.application.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTermsTemplateDto {
    private UUID id;
    private String templateName;
    private String description;
    private Boolean isActive;
    @Builder.Default
    private List<TemplateItemDto> items = new ArrayList<>();
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateItemDto {
        private UUID id;
        private String paymentTermName;
        private BigDecimal invoicePortion; // e.g. 30.00 (%)
        private Integer creditDays;
        private Integer creditMonths;
    }
}
