package com.nextgen.erp.crm.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record CrmCompetitorRequest(@NotBlank @Size(max=200) String name, @Size(max=255) String website, String description) {}
