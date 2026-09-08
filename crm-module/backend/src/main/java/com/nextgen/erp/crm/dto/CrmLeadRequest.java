package com.nextgen.erp.crm.dto;

import com.nextgen.erp.crm.domain.enums.CrmLeadStatus;
import lombok.Data;
import java.util.UUID;

@Data
public class CrmLeadRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String companyName;
    private String jobTitle;
    private UUID leadSourceId;
    private UUID marketSegmentId;
    private CrmLeadStatus status;
    private UUID assignedTo;
    private String notes;
}
