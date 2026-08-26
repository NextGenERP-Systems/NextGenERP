package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private UUID id;
    private String username;
    private String email;
    private String fullName;
    private UserRole role;
    private boolean active;
}
