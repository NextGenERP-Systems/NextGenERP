package com.nextgen.erp.crm.dto;
import com.nextgen.erp.crm.domain.enums.*; import jakarta.validation.Valid; import jakarta.validation.constraints.*; import lombok.Data; import java.time.OffsetDateTime; import java.util.UUID;
@Data public class CrmActivityRequest { @Valid @NotNull private CrmInteractionTargetRequest target; @NotNull private CrmActivityType activityType; @NotBlank @Size(max=255) private String subject; private String description; @NotNull private CrmActivityStatus status; private OffsetDateTime occurredAt; private OffsetDateTime dueAt; private UUID assignedTo; }
