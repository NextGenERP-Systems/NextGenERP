package com.nextgen.erp.crm.dto;

import com.nextgen.erp.crm.domain.enums.CrmLeadStatus;
import lombok.Data;
import jakarta.validation.constraints.*;
import java.util.UUID;

@Data
public class CrmLeadRequest {
    @Size(max = 100)
    private String firstName;
    @Size(max = 100)
    private String lastName;
    @Email @Size(max = 255)
    private String email;
    @Size(max = 50)
    private String phone;
    @Size(max = 255)
    private String companyName;
    @Size(max = 100)
    private String jobTitle;
    private UUID leadSourceId;
    private UUID marketSegmentId;
    private CrmLeadStatus status;
    private UUID assignedTo;
    private String notes;
}
