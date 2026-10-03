package com.nextgen.erp.crm.dto.phase5;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;

public final class Phase5Requests {
    private Phase5Requests() {}
    public enum Channel { EMAIL, SMS, EVENT, OTHER }
    public enum CampaignStatus { DRAFT, SCHEDULED, ACTIVE, PAUSED, COMPLETED, ARCHIVED }
    public enum TargetType { LEAD, PROSPECT, OPPORTUNITY }
    public enum ConsentState { OPTED_IN, OPTED_OUT, UNKNOWN }

    public record Campaign(@NotBlank @Size(max=200) String name, @Size(max=5000) String description,
            @NotNull Channel channel, OffsetDateTime startsAt, OffsetDateTime endsAt, UUID ownerId,
            @DecimalMin("0.00") @Digits(integer=13, fraction=2) BigDecimal budget,
            @Pattern(regexp="[A-Z]{3}") String currency) {}
    public record VersionedCampaign(@NotBlank @Size(max=200) String name, @Size(max=5000) String description,
            @NotNull Channel channel, @NotNull CampaignStatus status, OffsetDateTime startsAt, OffsetDateTime endsAt,
            UUID ownerId, @DecimalMin("0.00") @Digits(integer=13, fraction=2) BigDecimal budget,
            @Pattern(regexp="[A-Z]{3}") String currency, @NotNull @PositiveOrZero Long version) {}
    public record Cost(@NotNull @DecimalMin("0.00") @Digits(integer=13, fraction=2) BigDecimal amount,
            @NotBlank @Pattern(regexp="[A-Z]{3}") String currency, @NotNull LocalDate costDate,
            @Size(max=500) String description) {}
    public record Member(@NotNull UUID contactId) {}
    public record MemberStatus(@NotBlank String status) {}
    public record Touchpoint(@NotNull TargetType targetType, @NotNull UUID targetId, UUID campaignId,
            @NotBlank @Size(max=40) String eventType, @NotBlank @Size(max=200) String eventKey,
            @Size(max=100) String source, @Size(max=100) String medium, @Size(max=200) String utmSource,
            @Size(max=200) String utmMedium, @Size(max=200) String utmCampaign,
            @Size(max=200) String utmContent, @Size(max=200) String utmTerm, OffsetDateTime occurredAt) {}
    public record Template(@NotBlank @Size(max=200) String name, @NotNull Channel channel,
            @Size(max=998) String subject, @NotBlank @Size(max=100000) String body,
            Boolean active) {}
    public record Preference(@NotNull ConsentState consentState, @NotBlank @Size(max=100) String source) {}
    public record Enqueue(@NotNull UUID contactId, UUID campaignId, @NotNull UUID templateId,
            @NotBlank @Size(max=200) String idempotencyKey, Map<@NotBlank @Size(max=100) String, @Size(max=10000) String> variables,
            OffsetDateTime scheduledAt) {}
}
