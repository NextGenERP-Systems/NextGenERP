package com.nextgen.erp.crm.dto.phase6;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public final class Phase6Requests {
    private Phase6Requests() {}

    public record Contract(@NotBlank @Size(max=100) String contractNumber,
                           @NotBlank @Size(max=200) String name,
                           UUID opportunityId, UUID customerId,
                           LocalDate startsOn, LocalDate endsOn,
                           @NotNull @DecimalMin("0.00") BigDecimal totalAmount,
                           @NotBlank @Pattern(regexp="[A-Z]{3}") String currency,
                           String notes, Long version) {}
    public record ContractItem(@NotBlank @Size(max=500) String description,
                               UUID externalProductId,
                               @NotNull @DecimalMin(value="0.001") BigDecimal quantity,
                               @NotBlank @Size(max=40) String unit,
                               @NotNull @DecimalMin("0.00") BigDecimal unitPrice,
                               LocalDate warrantyStartsOn, LocalDate warrantyEndsOn) {}
    public record ContractStatus(@NotBlank String status, Long version) {}
    public record Fulfilment(@NotNull UUID contractId, UUID contractItemId,
                             @NotBlank String fulfilmentType, @NotBlank @Size(max=500) String description,
                             @DecimalMin("0.00") BigDecimal plannedQuantity,
                             @NotNull @DecimalMin("0.00") BigDecimal completedQuantity,
                             OffsetDateTime plannedAt, OffsetDateTime completedAt,
                             String externalReference) {}
    public record FulfilmentStatus(@NotBlank String status,
                                   @DecimalMin("0.00") BigDecimal completedQuantity,
                                   OffsetDateTime completedAt) {}
    public record WarrantyClaim(@NotBlank @Size(max=100) String claimNumber,
                                @NotNull UUID contractId, UUID contractItemId, UUID customerId,
                                @NotBlank @Size(max=200) String issue,
                                @NotBlank String description, LocalDate reportedOn) {}
    public record ClaimStatus(@NotBlank String status, String note, String resolution) {}
    public record MaintenanceSchedule(@NotNull UUID customerId, UUID contractId, UUID contractItemId,
                                     @NotBlank @Size(max=200) String name, String description,
                                     @NotNull LocalDate startsOn, LocalDate endsOn,
                                     @NotNull @Min(1) @Max(3650) Integer intervalDays,
                                     @NotNull LocalDate nextDueOn,
                                     @NotBlank @Size(max=80) String timezone) {}
    public record MaintenanceVisit(@NotNull OffsetDateTime dueAt, UUID assignedTo, String notes) {}
    public record VisitStatus(@NotBlank String status, OffsetDateTime completedAt, String notes) {}
    public record ScheduleStatus(@NotBlank String status) {}
}
