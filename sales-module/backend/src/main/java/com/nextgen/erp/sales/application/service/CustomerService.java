package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.CustomerCreateRequest;
import com.nextgen.erp.sales.application.dto.CustomerDto;
import com.nextgen.erp.sales.domain.exception.ResourceNotFoundException;
import com.nextgen.erp.sales.domain.model.Customer;
import com.nextgen.erp.sales.domain.model.CustomerAddress;
import com.nextgen.erp.sales.domain.model.CustomerContact;
import com.nextgen.erp.sales.domain.model.CustomerGroup;
import com.nextgen.erp.sales.domain.model.Territory;
import com.nextgen.erp.sales.infrastructure.repository.CustomerGroupRepository;
import com.nextgen.erp.sales.infrastructure.repository.CustomerRepository;
import com.nextgen.erp.sales.infrastructure.repository.TerritoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerGroupRepository customerGroupRepository;
    private final TerritoryRepository territoryRepository;

    @Transactional(readOnly = true)
    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomerDto getCustomerById(UUID id) {
        Customer customer = customerRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        return mapToDto(customer);
    }

    @Transactional
    public CustomerDto createCustomer(CustomerCreateRequest request) {
        String code = request.getCustomerCode();
        if (code == null || code.isBlank()) {
            code = "CUST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        CustomerGroup group = null;
        if (request.getCustomerGroupId() != null) {
            group = customerGroupRepository.findById(request.getCustomerGroupId()).orElse(null);
        }

        Territory territory = null;
        if (request.getTerritoryId() != null) {
            territory = territoryRepository.findById(request.getTerritoryId()).orElse(null);
        }

        Customer customer = Customer.builder()
                .customerCode(code)
                .customerName(request.getCustomerName())
                .customerType(request.getCustomerType())
                .customerGroup(group)
                .territory(territory)
                .defaultCurrency(request.getDefaultCurrency())
                .taxId(request.getTaxId())
                .creditLimit(request.getCreditLimit())
                .bypassCreditLimitCheck(request.getBypassCreditLimitCheck())
                .email(request.getEmail())
                .phone(request.getPhone())
                .website(request.getWebsite())
                .addresses(new ArrayList<>())
                .contacts(new ArrayList<>())
                .build();

        if (request.getAddresses() != null) {
            for (CustomerDto.AddressDto addrDto : request.getAddresses()) {
                customer.getAddresses().add(CustomerAddress.builder()
                        .customer(customer)
                        .addressTitle(addrDto.getAddressTitle())
                        .addressType(addrDto.getAddressType())
                        .addressLine1(addrDto.getAddressLine1())
                        .addressLine2(addrDto.getAddressLine2())
                        .city(addrDto.getCity())
                        .state(addrDto.getState())
                        .country(addrDto.getCountry())
                        .pincode(addrDto.getPincode())
                        .isPrimaryAddress(Boolean.TRUE.equals(addrDto.getIsPrimaryAddress()))
                        .isShippingAddress(Boolean.TRUE.equals(addrDto.getIsShippingAddress()))
                        .build());
            }
        }

        if (request.getContacts() != null) {
            for (CustomerDto.ContactDto contactDto : request.getContacts()) {
                customer.getContacts().add(CustomerContact.builder()
                        .customer(customer)
                        .firstName(contactDto.getFirstName())
                        .lastName(contactDto.getLastName())
                        .emailId(contactDto.getEmailId())
                        .mobileNo(contactDto.getMobileNo())
                        .designation(contactDto.getDesignation())
                        .isPrimaryContact(Boolean.TRUE.equals(contactDto.getIsPrimaryContact()))
                        .build());
            }
        }

        Customer saved = customerRepository.save(customer);
        return mapToDto(saved);
    }

    private CustomerDto mapToDto(Customer c) {
        return CustomerDto.builder()
                .id(c.getId())
                .customerCode(c.getCustomerCode())
                .customerName(c.getCustomerName())
                .customerType(c.getCustomerType())
                .customerGroupId(c.getCustomerGroup() != null ? c.getCustomerGroup().getId() : null)
                .customerGroupName(c.getCustomerGroup() != null ? c.getCustomerGroup().getName() : null)
                .territoryId(c.getTerritory() != null ? c.getTerritory().getId() : null)
                .territoryName(c.getTerritory() != null ? c.getTerritory().getName() : null)
                .defaultCurrency(c.getDefaultCurrency())
                .taxId(c.getTaxId())
                .creditLimit(c.getCreditLimit())
                .outstandingBalance(c.getOutstandingBalance())
                .availableCredit(c.getAvailableCredit())
                .bypassCreditLimitCheck(c.getBypassCreditLimitCheck())
                .isFrozen(c.getIsFrozen())
                .disabled(c.getDisabled())
                .email(c.getEmail())
                .phone(c.getPhone())
                .website(c.getWebsite())
                .createdAt(c.getCreatedAt())
                .addresses(c.getAddresses() != null ? c.getAddresses().stream().map(a -> CustomerDto.AddressDto.builder()
                        .id(a.getId())
                        .addressTitle(a.getAddressTitle())
                        .addressType(a.getAddressType())
                        .addressLine1(a.getAddressLine1())
                        .addressLine2(a.getAddressLine2())
                        .city(a.getCity())
                        .state(a.getState())
                        .country(a.getCountry())
                        .pincode(a.getPincode())
                        .isPrimaryAddress(a.getIsPrimaryAddress())
                        .isShippingAddress(a.getIsShippingAddress())
                        .build()).collect(Collectors.toList()) : List.of())
                .contacts(c.getContacts() != null ? c.getContacts().stream().map(ct -> CustomerDto.ContactDto.builder()
                        .id(ct.getId())
                        .firstName(ct.getFirstName())
                        .lastName(ct.getLastName())
                        .emailId(ct.getEmailId())
                        .mobileNo(ct.getMobileNo())
                        .designation(ct.getDesignation())
                        .isPrimaryContact(ct.getIsPrimaryContact())
                        .build()).collect(Collectors.toList()) : List.of())
                .build();
    }
}
