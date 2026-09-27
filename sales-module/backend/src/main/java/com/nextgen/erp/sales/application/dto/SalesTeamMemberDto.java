package com.nextgen.erp.sales.application.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesTeamMemberDto {
    private UUID id;
    private String voucherType;
    private UUID voucherId;
    private UUID salesPersonId;
    private String salesPersonName;
    private BigDecimal allocatedPercentage;
    private BigDecimal allocatedAmount;
    private BigDecimal commissionRate;
    private BigDecimal incentives;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
