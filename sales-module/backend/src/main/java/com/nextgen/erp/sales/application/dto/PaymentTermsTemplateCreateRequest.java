package com.nextgen.erp.sales.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTermsTemplateCreateRequest {

    @NotBlank(message = "Template name is required")
    private String templateName;

    private String description;

    @NotEmpty(message = "At least one term portion is required")
    private List<TemplateItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateItemRequest {
        @NotBlank(message = "Payment term name is required")
        private String paymentTermName;

        @NotNull(message = "Invoice portion is required")
        private BigDecimal invoicePortion; // percentage e.g. 30.00

        private Integer creditDays;
        private Integer creditMonths;
    }
}
