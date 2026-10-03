package com.nextgen.erp.crm.dto;

import com.nextgen.erp.crm.domain.enums.CrmProspectStatus;
import lombok.Data;
import jakarta.validation.constraints.*;
import java.util.UUID;

@Data
public class CrmProspectRequest {
    @NotBlank @Size(max = 255)
    private String companyName;
    @Size(max = 100)
    private String industry;
    @Size(max = 255)
    private String website;
    @Size(max = 200)
    private String primaryContactName;
    @Email @Size(max = 255)
    private String primaryContactEmail;
    @Size(max = 50)
    private String primaryContactPhone;
    private CrmProspectStatus status;
    private UUID customerId;
}
