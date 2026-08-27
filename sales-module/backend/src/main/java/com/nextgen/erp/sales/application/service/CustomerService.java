package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.*;
import com.nextgen.erp.sales.domain.exception.ResourceNotFoundException;
import com.nextgen.erp.sales.domain.model.*;
import com.nextgen.erp.sales.infrastructure.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerGroupRepository customerGroupRepository;
    private final TerritoryRepository territoryRepository;
    private final QuotationRepository quotationRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final DeliveryNoteRepository deliveryNoteRepository;
    private final SalesInvoiceRepository salesInvoiceRepository;
    private final PaymentEntryRepository paymentEntryRepository;
    private final GlEntryRepository glEntryRepository;

    private final QuotationService quotationService;
    private final SalesOrderService salesOrderService;
    private final DeliveryNoteService deliveryNoteService;
    private final SalesInvoiceService salesInvoiceService;
    private final PaymentEntryService paymentEntryService;

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

    @Transactional(readOnly = true)
    public Customer360DashboardDto getCustomer360Dashboard(UUID customerId) {
        Customer customer = customerRepository.findByIdWithDetails(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", customerId));

        CustomerDto custDto = mapToDto(customer);

        List<Quotation> quotations = quotationRepository.findByCustomerIdOrderByTransactionDateDesc(customerId);
        List<SalesOrder> salesOrders = salesOrderRepository.findByCustomerIdOrderByTransactionDateDesc(customerId);
        List<DeliveryNote> deliveryNotes = deliveryNoteRepository.findByCustomerId(customerId);
        List<SalesInvoice> salesInvoices = salesInvoiceRepository.findByCustomerId(customerId);
        List<PaymentEntry> paymentEntries = paymentEntryRepository.findByCustomerId(customerId);
        List<GlEntry> glEntries = glEntryRepository.findByCustomerIdOrderByPostingDateDesc(customerId);

        long quotesCount = quotations.size();
        BigDecimal quotesVal = quotations.stream()
                .map(Quotation::getGrandTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long ordersCount = salesOrders.size();
        BigDecimal ordersVal = salesOrders.stream()
                .map(SalesOrder::getGrandTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long dnCount = deliveryNotes.size();
        BigDecimal deliveredQty = deliveryNotes.stream()
                .map(DeliveryNote::getTotalQty)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long invCount = salesInvoices.size();
        BigDecimal invTotal = salesInvoices.stream()
                .map(SalesInvoice::getGrandTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal paidTotal = salesInvoices.stream()
                .map(SalesInvoice::getPaidAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal outTotal = salesInvoices.stream()
                .map(SalesInvoice::getOutstandingAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long payCount = paymentEntries.size();
        BigDecimal collectedTotal = paymentEntries.stream()
                .map(PaymentEntry::getPaidAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Customer360DashboardDto.builder()
                .customer(custDto)
                .totalQuotationsCount(quotesCount)
                .totalQuotationsValue(quotesVal)
                .totalSalesOrdersCount(ordersCount)
                .totalSalesOrdersValue(ordersVal)
                .totalDeliveryNotesCount(dnCount)
                .totalDeliveredQty(deliveredQty)
                .totalInvoicesCount(invCount)
                .totalInvoicedValue(invTotal)
                .totalPaidValue(paidTotal)
                .totalOutstandingValue(outTotal)
                .totalPaymentsCount(payCount)
                .totalCollectedAmount(collectedTotal)
                .recentQuotations(quotations.stream().map(quotationService::mapToDto).collect(Collectors.toList()))
                .recentSalesOrders(salesOrders.stream().map(salesOrderService::mapToDto).collect(Collectors.toList()))
                .recentDeliveryNotes(deliveryNotes.stream().map(deliveryNoteService::toDto).collect(Collectors.toList()))
                .recentSalesInvoices(salesInvoices.stream().map(salesInvoiceService::toDto).collect(Collectors.toList()))
                .recentPaymentEntries(paymentEntries.stream().map(paymentEntryService::toDto).collect(Collectors.toList()))
                .customerLedger(glEntries.stream().map(g -> GlEntryDto.builder()
                        .id(g.getId())
                        .postingDate(g.getPostingDate())
                        .voucherType(g.getVoucherType())
                        .voucherNo(g.getVoucherNo())
                        .voucherId(g.getVoucherId())
                        .account(g.getAccount())
                        .debit(g.getDebit())
                        .credit(g.getCredit())
                        .customerId(g.getCustomer() != null ? g.getCustomer().getId() : null)
                        .customerName(g.getCustomer() != null ? g.getCustomer().getCustomerName() : null)
                        .remarks(g.getRemarks())
                        .cancelled(g.isCancelled())
                        .createdAt(g.getCreatedAt())
                        .build()).collect(Collectors.toList()))
                .build();
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
                .taxCategory(request.getTaxCategory())
                .defaultReceivableAccount(request.getDefaultReceivableAccount() != null ? request.getDefaultReceivableAccount() : "1310 - Debtors / Accounts Receivable")
                .paymentTerms(request.getPaymentTerms())
                .defaultSalesPartner(request.getDefaultSalesPartner())
                .defaultCommissionRate(request.getDefaultCommissionRate() != null ? request.getDefaultCommissionRate() : BigDecimal.ZERO)
                .isInternalCustomer(Boolean.TRUE.equals(request.getIsInternalCustomer()))
                .representsCompany(request.getRepresentsCompany())
                .soRequired(Boolean.TRUE.equals(request.getSoRequired()))
                .dnRequired(Boolean.TRUE.equals(request.getDnRequired()))
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

    public CustomerDto mapToDto(Customer c) {
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
                .taxCategory(c.getTaxCategory())
                .defaultReceivableAccount(c.getDefaultReceivableAccount())
                .paymentTerms(c.getPaymentTerms())
                .defaultSalesPartner(c.getDefaultSalesPartner())
                .defaultCommissionRate(c.getDefaultCommissionRate())
                .isInternalCustomer(c.getIsInternalCustomer())
                .representsCompany(c.getRepresentsCompany())
                .soRequired(c.getSoRequired())
                .dnRequired(c.getDnRequired())
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
