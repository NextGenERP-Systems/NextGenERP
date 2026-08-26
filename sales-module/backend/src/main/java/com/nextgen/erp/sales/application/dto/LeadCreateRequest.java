package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.LeadStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadCreateRequest {
    @NotBlank(message = "Lead name is required")
    private String leadName;
    private String companyName;
    private String email;
    private String phone;
    private LeadStatus status;
    private String leadSource;
    private UUID territoryId;
    private String notes;
}
