package com.nextgen.erp.sales.application.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesTeamSaveRequest {

    private BigDecimal grandTotal;

    @NotEmpty(message = "Sales team must contain at least one member")
    private List<MemberEntry> members;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberEntry {
        @NotNull(message = "Sales person ID is required")
        private UUID salesPersonId;

        private String salesPersonName;

        @NotNull(message = "Allocated percentage is required")
        private BigDecimal allocatedPercentage;

        private BigDecimal commissionRate;
    }
}
