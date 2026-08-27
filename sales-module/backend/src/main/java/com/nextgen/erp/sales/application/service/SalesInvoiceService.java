package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.*;
import com.nextgen.erp.sales.domain.engine.TaxCalculationEngine;
import com.nextgen.erp.sales.domain.model.*;
import com.nextgen.erp.sales.infrastructure.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalesInvoiceService {

    private final SalesInvoiceRepository salesInvoiceRepository;
    private final CustomerRepository customerRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final DeliveryNoteRepository deliveryNoteRepository;
    private final ItemRepository itemRepository;
    private final SalesTaxAndChargeRepository taxRepository;
    private final TaxCalculationEngine taxCalculationEngine;
    private final GeneralLedgerService generalLedgerService;

    @Transactional(readOnly = true)
    public List<SalesInvoiceDto> getAllSalesInvoices() {
        return salesInvoiceRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalesInvoiceDto getSalesInvoiceById(UUID id) {
        SalesInvoice invoice = salesInvoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sales Invoice not found with id: " + id));
        return toDto(invoice);
    }

    @Transactional
    public SalesInvoiceDto createSalesInvoice(SalesInvoiceCreateRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + request.getCustomerId()));

        String invoiceNumber = generateInvoiceNumber();
        LocalDate postingDate = request.getPostingDate() != null ? request.getPostingDate() : LocalDate.now();
        LocalDate dueDate = request.getDueDate() != null ? request.getDueDate() : postingDate.plusDays(30);
        String currency = request.getCurrency() != null ? request.getCurrency() : "INR";
        BigDecimal conversionRate = request.getConversionRate() != null ? request.getConversionRate() : BigDecimal.ONE;

        SalesInvoice invoice = SalesInvoice.builder()
                .invoiceNumber(invoiceNumber)
                .salesOrderId(request.getSalesOrderId())
                .deliveryNoteId(request.getDeliveryNoteId())
                .customer(customer)
                .customerName(customer.getCustomerName())
                .postingDate(postingDate)
                .dueDate(dueDate)
                .status(SalesInvoiceStatus.UNPAID)
                .currency(currency)
                .conversionRate(conversionRate)
                .paymentTerms(request.getPaymentTerms() != null ? request.getPaymentTerms() : "Net 30 Days")
                .notes(request.getNotes())
                .items(new ArrayList<>())
                .build();

        BigDecimal netTotal = BigDecimal.ZERO;

        for (SalesInvoiceCreateRequest.ItemEntry itemEntry : request.getItems()) {
            Item item = null;
            if (itemEntry.getItemId() != null) {
                item = itemRepository.findById(itemEntry.getItemId()).orElse(null);
            }

            BigDecimal qty = itemEntry.getQty() != null ? itemEntry.getQty() : BigDecimal.ONE;
            BigDecimal rate = itemEntry.getRate() != null ? itemEntry.getRate() : BigDecimal.ZERO;
            BigDecimal lineAmount = qty.multiply(rate);

            SalesInvoiceItem invItem = SalesInvoiceItem.builder()
                    .salesInvoice(invoice)
                    .salesOrderItemId(itemEntry.getSalesOrderItemId())
                    .item(item)
                    .itemCode(itemEntry.getItemCode())
                    .itemName(itemEntry.getItemName())
                    .qty(qty)
                    .rate(rate)
                    .amount(lineAmount)
                    .incomeAccount(itemEntry.getIncomeAccount() != null ? itemEntry.getIncomeAccount() : GeneralLedgerService.ACC_SALES_REVENUE)
                    .build();

            invoice.getItems().add(invItem);
            netTotal = netTotal.add(lineAmount);
        }

        // --- Tax Calculation using TaxCalculationEngine ---
        List<SalesTaxAndCharge> taxesToProcess = new ArrayList<>();

        if (request.getTaxes() != null && !request.getTaxes().isEmpty()) {
            for (int i = 0; i < request.getTaxes().size(); i++) {
                SalesInvoiceCreateRequest.TaxEntry t = request.getTaxes().get(i);
                taxesToProcess.add(SalesTaxAndCharge.builder()
                        .voucherType("Sales Invoice")
                        .idx(i + 1)
                        .chargeType(t.getChargeType() != null ? t.getChargeType() : TaxChargeType.ON_NET_TOTAL)
                        .rowId(t.getRowId())
                        .accountHead(t.getAccountHead() != null ? t.getAccountHead() : GeneralLedgerService.ACC_TAX_PAYABLE)
                        .description(t.getDescription() != null ? t.getDescription() : "Output Sales Tax")
                        .rate(t.getRate() != null ? t.getRate() : new BigDecimal("18.00"))
                        .build());
            }
        } else if (request.getSalesOrderId() != null) {
            // Carry forward tax structure from parent Sales Order if available
            List<SalesTaxAndCharge> parentTaxes = taxRepository.findByVoucherTypeAndVoucherIdOrderByIdxAsc("Sales Order", request.getSalesOrderId());
            if (!parentTaxes.isEmpty()) {
                for (SalesTaxAndCharge pt : parentTaxes) {
                    taxesToProcess.add(SalesTaxAndCharge.builder()
                            .voucherType("Sales Invoice")
                            .idx(pt.getIdx())
                            .chargeType(pt.getChargeType())
                            .rowId(pt.getRowId())
                            .accountHead(pt.getAccountHead())
                            .description(pt.getDescription())
                            .rate(pt.getRate())
                            .build());
                }
            } else {
                taxesToProcess.add(SalesTaxAndCharge.builder()
                        .voucherType("Sales Invoice")
                        .idx(1)
                        .chargeType(TaxChargeType.ON_NET_TOTAL)
                        .accountHead(GeneralLedgerService.ACC_TAX_PAYABLE)
                        .description("GST Output Tax (18%)")
                        .rate(new BigDecimal("18.00"))
                        .build());
            }
        } else {
            // Default template tax via TaxCalculationEngine (18% Output GST)
            taxesToProcess.add(SalesTaxAndCharge.builder()
                    .voucherType("Sales Invoice")
                    .idx(1)
                    .chargeType(TaxChargeType.ON_NET_TOTAL)
                    .accountHead(GeneralLedgerService.ACC_TAX_PAYABLE)
                    .description("GST Output Tax (18%)")
                    .rate(new BigDecimal("18.00"))
                    .build());
        }

        TaxCalculationEngine.TaxCalculationResult taxResult = taxCalculationEngine.calculateTaxes(
                netTotal,
                conversionRate,
                taxesToProcess
        );

        BigDecimal totalTax = taxResult.totalTaxesAndCharges();
        BigDecimal grandTotal = taxResult.grandTotal();

        invoice.setNetTotal(netTotal);
        invoice.setTotalTax(totalTax);
        invoice.setGrandTotal(grandTotal);
        invoice.setOutstandingAmount(grandTotal);
        invoice.setPaidAmount(BigDecimal.ZERO);

        SalesInvoice saved = salesInvoiceRepository.save(invoice);

        // Save invoice tax breakdown rows
        for (SalesTaxAndCharge tax : taxResult.calculatedTaxes()) {
            tax.setVoucherId(saved.getId());
            taxRepository.save(tax);
        }

        // 1. Post double-entry General Ledger (GL)
        generalLedgerService.postSalesInvoiceGl(saved);

        // 2. Update Customer outstanding balance
        customer.setOutstandingBalance(customer.getOutstandingBalance().add(grandTotal));
        customerRepository.save(customer);

        // 3. Update Parent Sales Order Billing Status
        if (request.getSalesOrderId() != null) {
            updateParentSalesOrderBilling(request.getSalesOrderId());
        }

        log.info("Created Sales Invoice {} for customer {} (Grand Total: {}) with double-entry GL posting", saved.getInvoiceNumber(), saved.getCustomerName(), grandTotal);
        return toDto(saved);
    }

    @Transactional
    public SalesInvoiceDto makeFromSalesOrder(UUID salesOrderId) {
        SalesOrder so = salesOrderRepository.findById(salesOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Sales Order not found: " + salesOrderId));

        List<SalesInvoiceCreateRequest.ItemEntry> itemEntries = so.getItems().stream()
                .map(item -> SalesInvoiceCreateRequest.ItemEntry.builder()
                        .salesOrderItemId(item.getId())
                        .itemId(item.getItem() != null ? item.getItem().getId() : null)
                        .itemCode(item.getItemCode())
                        .itemName(item.getItemName())
                        .qty(item.getQty())
                        .rate(item.getRate())
                        .incomeAccount("4110 - Sales Revenue")
                        .build())
                .collect(Collectors.toList());

        SalesInvoiceCreateRequest request = SalesInvoiceCreateRequest.builder()
                .salesOrderId(so.getId())
                .customerId(so.getCustomer().getId())
                .postingDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(30))
                .paymentTerms("Net 30 Days")
                .notes("Generated from Sales Order: " + so.getOrderNumber())
                .items(itemEntries)
                .build();

        return createSalesInvoice(request);
    }

    @Transactional
    public SalesInvoiceDto makeFromDeliveryNote(UUID deliveryNoteId) {
        DeliveryNote dn = deliveryNoteRepository.findById(deliveryNoteId)
                .orElseThrow(() -> new IllegalArgumentException("Delivery Note not found: " + deliveryNoteId));

        List<SalesInvoiceCreateRequest.ItemEntry> itemEntries = dn.getItems().stream()
                .map(item -> SalesInvoiceCreateRequest.ItemEntry.builder()
                        .salesOrderItemId(item.getSalesOrderItemId())
                        .itemId(item.getItem() != null ? item.getItem().getId() : null)
                        .itemCode(item.getItemCode())
                        .itemName(item.getItemName())
                        .qty(item.getQty())
                        .rate(item.getRate())
                        .incomeAccount("4110 - Sales Revenue")
                        .build())
                .collect(Collectors.toList());

        SalesInvoiceCreateRequest request = SalesInvoiceCreateRequest.builder()
                .salesOrderId(dn.getSalesOrderId())
                .deliveryNoteId(dn.getId())
                .customerId(dn.getCustomer().getId())
                .postingDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(30))
                .paymentTerms("Net 30 Days")
                .notes("Generated from Delivery Note: " + dn.getDeliveryNoteNumber())
                .items(itemEntries)
                .build();

        return createSalesInvoice(request);
    }

    @Transactional
    public SalesInvoiceDto cancelSalesInvoice(UUID id) {
        SalesInvoice invoice = salesInvoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sales Invoice not found with id: " + id));

        if (invoice.getStatus() == SalesInvoiceStatus.CANCELLED) {
            throw new IllegalStateException("Sales Invoice " + invoice.getInvoiceNumber() + " is already cancelled");
        }

        if (invoice.getPaidAmount() != null && invoice.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalStateException("Cannot cancel invoice " + invoice.getInvoiceNumber() + " with active payments. Cancel payments first.");
        }

        // 1. Revert customer balance
        Customer customer = invoice.getCustomer();
        if (customer != null && invoice.getOutstandingAmount() != null) {
            BigDecimal newBal = customer.getOutstandingBalance().subtract(invoice.getOutstandingAmount());
            if (newBal.compareTo(BigDecimal.ZERO) < 0) newBal = BigDecimal.ZERO;
            customer.setOutstandingBalance(newBal);
            customerRepository.save(customer);
        }

        // 2. Post Contra Reversal in General Ledger
        generalLedgerService.reverseSalesInvoiceGl(invoice);

        // 3. Mark status cancelled
        invoice.setStatus(SalesInvoiceStatus.CANCELLED);
        invoice.setOutstandingAmount(BigDecimal.ZERO);
        SalesInvoice saved = salesInvoiceRepository.save(invoice);

        // 4. Update Parent Sales Order billing status if linked
        if (saved.getSalesOrderId() != null) {
            updateParentSalesOrderBilling(saved.getSalesOrderId());
        }

        log.info("Cancelled Sales Invoice {} with GL contra entries", saved.getInvoiceNumber());
        return toDto(saved);
    }

    @Transactional
    public void updateParentSalesOrderBilling(UUID salesOrderId) {
        SalesOrder so = salesOrderRepository.findById(salesOrderId).orElse(null);
        if (so == null) return;

        List<SalesInvoice> invoices = salesInvoiceRepository.findBySalesOrderId(salesOrderId);
        List<SalesInvoice> activeInvoices = invoices.stream()
                .filter(inv -> inv.getStatus() != SalesInvoiceStatus.CANCELLED)
                .collect(Collectors.toList());

        BigDecimal totalBilledQty = BigDecimal.ZERO;
        for (SalesInvoice inv : activeInvoices) {
            for (SalesInvoiceItem item : inv.getItems()) {
                totalBilledQty = totalBilledQty.add(item.getQty());
            }
        }

        BigDecimal totalOrderQty = so.getItems().stream()
                .map(SalesOrderItem::getQty)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal perBilled = BigDecimal.ZERO;
        if (totalOrderQty.compareTo(BigDecimal.ZERO) > 0) {
            perBilled = totalBilledQty.divide(totalOrderQty, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100.00"))
                    .setScale(2, RoundingMode.HALF_UP);
            if (perBilled.compareTo(new BigDecimal("100.00")) > 0) {
                perBilled = new BigDecimal("100.00");
            }
        }

        so.setPerBilled(perBilled);

        if (perBilled.compareTo(BigDecimal.ZERO) == 0) {
            so.setBillingStatus(BillingStatus.NOT_BILLED);
        } else if (perBilled.compareTo(new BigDecimal("100.00")) >= 0) {
            so.setBillingStatus(BillingStatus.FULLY_BILLED);
        } else {
            so.setBillingStatus(BillingStatus.PARTLY_BILLED);
        }

        // Check overall Sales Order status
        if (so.getDeliveryStatus() == DeliveryStatus.FULLY_DELIVERED && so.getBillingStatus() == BillingStatus.FULLY_BILLED) {
            so.setStatus(SalesOrderStatus.COMPLETED);
        } else if (so.getDeliveryStatus() == DeliveryStatus.FULLY_DELIVERED && so.getBillingStatus() == BillingStatus.NOT_BILLED) {
            so.setStatus(SalesOrderStatus.TO_BILL);
        } else if (so.getDeliveryStatus() == DeliveryStatus.NOT_DELIVERED && so.getBillingStatus() == BillingStatus.FULLY_BILLED) {
            so.setStatus(SalesOrderStatus.TO_DELIVER);
        }

        salesOrderRepository.save(so);
        log.info("Updated Sales Order {} billing: perBilled={}%, status={}", so.getOrderNumber(), perBilled, so.getStatus());
    }

    private String generateInvoiceNumber() {
        long count = salesInvoiceRepository.count() + 1;
        return String.format("SINV-%d-%04d", LocalDate.now().getYear(), count);
    }

    public SalesInvoiceDto toDto(SalesInvoice invoice) {
        List<SalesInvoiceItemDto> itemDtos = invoice.getItems().stream()
                .map(item -> SalesInvoiceItemDto.builder()
                        .id(item.getId())
                        .salesOrderItemId(item.getSalesOrderItemId())
                        .itemId(item.getItem() != null ? item.getItem().getId() : null)
                        .itemCode(item.getItemCode())
                        .itemName(item.getItemName())
                        .qty(item.getQty())
                        .rate(item.getRate())
                        .amount(item.getAmount())
                        .incomeAccount(item.getIncomeAccount())
                        .build())
                .collect(Collectors.toList());

        List<SalesTaxAndCharge> taxes = taxRepository.findByVoucherTypeAndVoucherIdOrderByIdxAsc("Sales Invoice", invoice.getId());
        List<SalesTaxAndChargeDto> taxDtos = taxes.stream().map(t -> SalesTaxAndChargeDto.builder()
                .id(t.getId())
                .idx(t.getIdx())
                .chargeType(t.getChargeType())
                .rowId(t.getRowId())
                .accountHead(t.getAccountHead())
                .description(t.getDescription())
                .rate(t.getRate())
                .taxAmount(t.getTaxAmount())
                .total(t.getTotal())
                .baseTaxAmount(t.getBaseTaxAmount())
                .baseTotal(t.getBaseTotal())
                .build()).collect(Collectors.toList());

        BigDecimal grandTotal = invoice.getGrandTotal() != null ? invoice.getGrandTotal() : BigDecimal.ZERO;
        String inWords = NumberToWordsConverter.convert(grandTotal, invoice.getCurrency() != null ? invoice.getCurrency() : "INR");
        BigDecimal roundedTotal = grandTotal.setScale(0, RoundingMode.HALF_UP);

        return SalesInvoiceDto.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .salesOrderId(invoice.getSalesOrderId())
                .deliveryNoteId(invoice.getDeliveryNoteId())
                .customerId(invoice.getCustomer().getId())
                .customerName(invoice.getCustomerName())
                .postingDate(invoice.getPostingDate())
                .dueDate(invoice.getDueDate())
                .status(invoice.getStatus())
                .currency(invoice.getCurrency())
                .conversionRate(invoice.getConversionRate())
                .netTotal(invoice.getNetTotal())
                .totalTax(invoice.getTotalTax())
                .grandTotal(grandTotal)
                .roundedTotal(roundedTotal)
                .inWords(inWords)
                .paidAmount(invoice.getPaidAmount())
                .outstandingAmount(invoice.getOutstandingAmount())
                .paymentTerms(invoice.getPaymentTerms())
                .notes(invoice.getNotes())
                .items(itemDtos)
                .taxes(taxDtos)
                .createdAt(invoice.getCreatedAt())
                .updatedAt(invoice.getUpdatedAt())
                .build();
    }
}
