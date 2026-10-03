package com.nextgen.erp.crm.dto;
import jakarta.validation.Valid; import jakarta.validation.constraints.*; import lombok.Data;
@Data public class CrmNoteRequest { @Valid @NotNull private CrmInteractionTargetRequest target; @NotBlank private String content; }
