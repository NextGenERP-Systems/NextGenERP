package com.nextgen.erp.crm.dto;
import com.nextgen.erp.crm.domain.enums.CrmInteractionTargetType; import jakarta.validation.constraints.NotNull; import lombok.Data; import java.util.UUID;
@Data public class CrmInteractionTargetRequest { @NotNull private CrmInteractionTargetType targetType; @NotNull private UUID targetId; }
