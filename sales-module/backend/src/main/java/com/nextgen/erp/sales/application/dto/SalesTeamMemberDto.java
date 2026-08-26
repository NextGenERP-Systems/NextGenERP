package com.nextgen.erp.sales.application.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class SalesTeamMemberDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberDto {
        private UUID id;
        private String salesPersonName;
        private BigDecimal allocatedPercentage;
        private BigDecimal allocatedAmount;
        private BigDecimal commissionRate;
        private BigDecimal incentives;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScheduleDto {
        private UUID id;
        private String paymentTerm;
        private LocalDate dueDate;
        private BigDecimal invoicePortion;
        private BigDecimal paymentAmount;
        private BigDecimal outstanding;
        private BigDecimal paidAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReservationDto {
        private UUID id;
        private UUID salesOrderItemId;
        private String itemCode;
        private String warehouse;
        private BigDecimal reservedQty;
        private BigDecimal deliveredQty;
        private String status;
        private OffsetDateTime createdAt;
    }
}
