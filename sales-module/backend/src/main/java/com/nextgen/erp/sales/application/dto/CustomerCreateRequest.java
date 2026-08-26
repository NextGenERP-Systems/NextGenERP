package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.CustomerType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerCreateRequest {
    private String customerCode;
    
    @NotBlank(message = "Customer name is required")
    private String customerName;
    
    @NotNull(message = "Customer type is required")
    @Builder.Default
    private CustomerType customerType = CustomerType.COMPANY;
    
    private UUID customerGroupId;
    private UUID territoryId;
    
    @Builder.Default
    private String defaultCurrency = "INR";
    
    private String taxId;
    
    @Builder.Default
    private BigDecimal creditLimit = new BigDecimal("50000.00");
    
    @Builder.Default
    private Boolean bypassCreditLimitCheck = false;
    
    private String email;
    private String phone;
    private String website;
    
    private List<CustomerDto.AddressDto> addresses;
    private List<CustomerDto.ContactDto> contacts;
}
