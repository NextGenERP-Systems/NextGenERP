package com.nextgen.erp.workflow.api.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BulkActionRequest {
    private List<UUID> documentIds;
    private String action;
    private String role;
    private String username;
    private String comments;
}
