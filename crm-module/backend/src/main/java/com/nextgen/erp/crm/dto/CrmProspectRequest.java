package com.nextgen.erp.crm.dto;

import com.nextgen.erp.crm.domain.enums.CrmProspectStatus;
import lombok.Data;
import java.util.UUID;

@Data
public class CrmProspectRequest {
    private String companyName;
    private String industry;
    private String website;
    private String primaryContactName;
    private String primaryContactEmail;
    private String primaryContactPhone;
    private CrmProspectStatus status;
    private UUID customerId;
}
