package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.*;
import com.nextgen.erp.sales.domain.model.*;
import com.nextgen.erp.sales.infrastructure.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentEntryService {

    private final PaymentEntryRepository paymentEntryRepository;
    private final CustomerRepository customerRepository;
    private final SalesInvoiceRepository salesInvoiceRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final GeneralLedgerService generalLedgerService;

    @Transactional(readOnly = true)
    public List<PaymentEntryDto> getAllPayments() {
        return paymentEntryRepository.findAllByOrderByPostingDateDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentEntryDto getPaymentById(UUID id) {
        PaymentEntry payment = paymentEntryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment Entry not found with id: " + id));
        return toDto(payment);
    }

    @Transactional
    public PaymentEntryDto recordPayment(PaymentEntryCreateRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + request.getCustomerId()));

        String paymentNumber = generatePaymentNumber();
        BigDecimal paidAmount = request.getPaidAmount();

        PaymentEntry payment = PaymentEntry.builder()
                .paymentNumber(paymentNumber)
                .paymentType(request.getPaymentType() != null ? request.getPaymentType() : PaymentType.RECEIVE)
                .paymentMode(request.getPaymentMode() != null ? request.getPaymentMode() : PaymentMode.BANK_TRANSFER)
                .customer(customer)
                .salesInvoiceId(request.getSalesInvoiceId())
                .salesOrderId(request.getSalesOrderId())
                .postingDate(request.getPostingDate() != null ? request.getPostingDate() : LocalDate.now())
                .paidAmount(paidAmount)
                .referenceNo(request.getReferenceNo())
                .referenceDate(request.getReferenceDate() != null ? request.getReferenceDate() : LocalDate.now())
                .notes(request.getNotes())
                .build();

        PaymentEntry saved = paymentEntryRepository.save(payment);

        // 1. Allocate against Sales Invoice if provided
        if (request.getSalesInvoiceId() != null) {
            SalesInvoice invoice = salesInvoiceRepository.findById(request.getSalesInvoiceId()).orElse(null);
            if (invoice != null) {
                BigDecimal newPaid = invoice.getPaidAmount().add(paidAmount);
                BigDecimal newOutstanding = invoice.getGrandTotal().subtract(newPaid);
                if (newOutstanding.compareTo(BigDecimal.ZERO) < 0) {
                    newOutstanding = BigDecimal.ZERO;
                }
                invoice.setPaidAmount(newPaid);
                invoice.setOutstandingAmount(newOutstanding);

                if (newOutstanding.compareTo(BigDecimal.ZERO) == 0) {
                    invoice.setStatus(SalesInvoiceStatus.PAID);
                } else {
                    invoice.setStatus(SalesInvoiceStatus.PARTLY_PAID);
                }
                salesInvoiceRepository.save(invoice);
                log.info("Applied payment {} to invoice {}. Remaining outstanding: {}", paidAmount, invoice.getInvoiceNumber(), newOutstanding);
            }
        }

        // 1. Post double-entry General Ledger (GL)
        generalLedgerService.postPaymentEntryGl(saved);

        // 2. Adjust customer outstanding balance
        BigDecimal currentOutstanding = customer.getOutstandingBalance();
        BigDecimal newCustomerBalance = currentOutstanding.subtract(paidAmount);
        if (newCustomerBalance.compareTo(BigDecimal.ZERO) < 0) {
            newCustomerBalance = BigDecimal.ZERO;
        }
        customer.setOutstandingBalance(newCustomerBalance);
        customerRepository.save(customer);

        // 3. Update Sales Order advance if provided
        if (request.getSalesOrderId() != null) {
            SalesOrder so = salesOrderRepository.findById(request.getSalesOrderId()).orElse(null);
            if (so != null) {
                BigDecimal currentAdvance = so.getAdvancePaid() != null ? so.getAdvancePaid() : BigDecimal.ZERO;
                so.setAdvancePaid(currentAdvance.add(paidAmount));
                salesOrderRepository.save(so);
            }
        }

        log.info("Recorded payment entry {} (Amount: {}) for customer {} with GL ledger posting", saved.getPaymentNumber(), paidAmount, customer.getCustomerName());
        return toDto(saved);
    }

    private String generatePaymentNumber() {
        long count = paymentEntryRepository.count() + 1;
        return String.format("PAY-%d-%04d", LocalDate.now().getYear(), count);
    }

    public PaymentEntryDto toDto(PaymentEntry payment) {
        return PaymentEntryDto.builder()
                .id(payment.getId())
                .paymentNumber(payment.getPaymentNumber())
                .paymentType(payment.getPaymentType())
                .paymentMode(payment.getPaymentMode())
                .customerId(payment.getCustomer().getId())
                .customerName(payment.getCustomer().getCustomerName())
                .salesInvoiceId(payment.getSalesInvoiceId())
                .salesOrderId(payment.getSalesOrderId())
                .postingDate(payment.getPostingDate())
                .paidAmount(payment.getPaidAmount())
                .referenceNo(payment.getReferenceNo())
                .referenceDate(payment.getReferenceDate())
                .notes(payment.getNotes())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
