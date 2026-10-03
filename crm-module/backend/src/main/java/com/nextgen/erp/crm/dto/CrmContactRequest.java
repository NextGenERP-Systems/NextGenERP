package com.nextgen.erp.crm.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record CrmContactRequest(
        @NotBlank @Size(max = 100) String firstName,
        @Size(max = 100) String lastName,
        @Email @Size(max = 255) String email,
        @Size(max = 50) String phone,
        @Size(max = 120) String jobTitle,
        boolean primary,
        UUID leadId,
        UUID prospectId,
        UUID opportunityId,
        UUID customerId) {
    @AssertTrue(message = "Exactly one of leadId, prospectId, opportunityId or customerId is required")
    public boolean hasExactlyOneOwner() {
        return java.util.stream.Stream.of(leadId, prospectId, opportunityId, customerId).filter(java.util.Objects::nonNull).count() == 1;
    }
}
