package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.CustomerType;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDto {
    private UUID id;
    private String customerCode;
    private String customerName;
    private CustomerType customerType;
    private UUID customerGroupId;
    private String customerGroupName;
    private UUID territoryId;
    private String territoryName;
    private String defaultCurrency;
    private String taxId;
    private String taxCategory;
    private String defaultReceivableAccount;
    private String paymentTerms;
    private String defaultSalesPartner;
    private BigDecimal defaultCommissionRate;
    private Boolean isInternalCustomer;
    private String representsCompany;
    private Boolean soRequired;
    private Boolean dnRequired;
    private BigDecimal creditLimit;
    private BigDecimal outstandingBalance;
    private BigDecimal availableCredit;
    private Boolean bypassCreditLimitCheck;
    private Boolean isFrozen;
    private Boolean disabled;
    private String email;
    private String phone;
    private String website;
    private List<AddressDto> addresses;
    private List<ContactDto> contacts;
    private OffsetDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressDto {
        private UUID id;
        private String addressTitle;
        private String addressType;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String country;
        private String pincode;
        private Boolean isPrimaryAddress;
        private Boolean isShippingAddress;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContactDto {
        private UUID id;
        private String firstName;
        private String lastName;
        private String emailId;
        private String mobileNo;
        private String designation;
        private Boolean isPrimaryContact;
    }
}
