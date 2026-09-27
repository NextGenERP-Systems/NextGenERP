package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.*;
import com.nextgen.erp.sales.domain.exception.BusinessValidationException;
import com.nextgen.erp.sales.domain.exception.ResourceNotFoundException;
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
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentTermsService {

    private final PaymentTermsTemplateRepository templateRepository;
    private final PaymentScheduleRepository scheduleRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final QuotationRepository quotationRepository;
    private final SalesInvoiceService salesInvoiceService;

    // ==================== TEMPLATES ====================

    @Transactional
    public List<PaymentTermsTemplateDto> getAllTemplates() {
        List<PaymentTermsTemplate> list = templateRepository.findAllByOrderByTemplateNameAsc();
        if (list.isEmpty()) {
            seedDefaultTemplates();
            list = templateRepository.findAllByOrderByTemplateNameAsc();
        }
        return list.stream().map(this::mapTemplateToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentTermsTemplateDto getTemplateById(UUID id) {
        PaymentTermsTemplate t = templateRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTermsTemplate", id));
        return mapTemplateToDto(t);
    }

    @Transactional
    public PaymentTermsTemplateDto createTemplate(PaymentTermsTemplateCreateRequest request) {
        if (templateRepository.findByTemplateName(request.getTemplateName()).isPresent()) {
            throw new BusinessValidationException("Payment Terms Template with name '" + request.getTemplateName() + "' already exists");
        }

        BigDecimal totalPortion = request.getItems().stream()
                .map(PaymentTermsTemplateCreateRequest.TemplateItemRequest::getInvoicePortion)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalPortion.compareTo(new BigDecimal("100.00")) != 0) {
            throw new BusinessValidationException("Sum of milestone invoice portions must equal exactly 100.00%. Current sum: " + totalPortion + "%");
        }

        PaymentTermsTemplate template = PaymentTermsTemplate.builder()
                .templateName(request.getTemplateName())
                .description(request.getDescription())
                .isActive(true)
                .build();

        for (PaymentTermsTemplateCreateRequest.TemplateItemRequest itemReq : request.getItems()) {
            PaymentTermsTemplateItem item = PaymentTermsTemplateItem.builder()
                    .paymentTermName(itemReq.getPaymentTermName())
                    .invoicePortion(itemReq.getInvoicePortion())
                    .creditDays(itemReq.getCreditDays() != null ? itemReq.getCreditDays() : 0)
                    .creditMonths(itemReq.getCreditMonths() != null ? itemReq.getCreditMonths() : 0)
                    .build();
            template.addItem(item);
        }

        PaymentTermsTemplate saved = templateRepository.save(template);
        log.info("Created Payment Terms Template: {}", saved.getTemplateName());
        return mapTemplateToDto(saved);
    }

    @Transactional
    public void seedDefaultTemplates() {
        if (templateRepository.count() > 0) return;

        // 1. 30-50-20 Milestone Schedule
        PaymentTermsTemplate t1 = PaymentTermsTemplate.builder()
                .templateName("30-50-20 Milestone Schedule")
                .description("30% Advance on order, 50% on delivery note, 20% Net 30 Days")
                .isActive(true)
                .build();
        t1.addItem(PaymentTermsTemplateItem.builder().paymentTermName("30% Advance Deposit").invoicePortion(new BigDecimal("30.00")).creditDays(0).creditMonths(0).build());
        t1.addItem(PaymentTermsTemplateItem.builder().paymentTermName("50% Dispatch & Delivery").invoicePortion(new BigDecimal("50.00")).creditDays(14).creditMonths(0).build());
        t1.addItem(PaymentTermsTemplateItem.builder().paymentTermName("20% Final Settlement (Net 30)").invoicePortion(new BigDecimal("20.00")).creditDays(44).creditMonths(0).build());
        templateRepository.save(t1);

        // 2. 50-50 Advance & Completion
        PaymentTermsTemplate t2 = PaymentTermsTemplate.builder()
                .templateName("50-50 Advance & Delivery")
                .description("50% Advance on contract, 50% on product delivery")
                .isActive(true)
                .build();
        t2.addItem(PaymentTermsTemplateItem.builder().paymentTermName("50% Advance Booking").invoicePortion(new BigDecimal("50.00")).creditDays(0).creditMonths(0).build());
        t2.addItem(PaymentTermsTemplateItem.builder().paymentTermName("50% Upon Delivery (Net 15)").invoicePortion(new BigDecimal("50.00")).creditDays(15).creditMonths(0).build());
        templateRepository.save(t2);

        // 3. 100% Advance
        PaymentTermsTemplate t3 = PaymentTermsTemplate.builder()
                .templateName("100% Advance")
                .description("100% payment required prior to dispatch or order fulfillment")
                .isActive(true)
                .build();
        t3.addItem(PaymentTermsTemplateItem.builder().paymentTermName("Full Advance Payment").invoicePortion(new BigDecimal("100.00")).creditDays(0).creditMonths(0).build());
        templateRepository.save(t3);

        // 4. Net 30 Days
        PaymentTermsTemplate t4 = PaymentTermsTemplate.builder()
                .templateName("Net 30 Days")
                .description("Standard 30-day post-delivery commercial credit terms")
                .isActive(true)
                .build();
        t4.addItem(PaymentTermsTemplateItem.builder().paymentTermName("Net 30 Days").invoicePortion(new BigDecimal("100.00")).creditDays(30).creditMonths(0).build());
        templateRepository.save(t4);

        log.info("Seeded 4 default ERPNext Payment Terms Templates");
    }

    // ==================== SCHEDULE GENERATION & QUERY ====================

    @Transactional(readOnly = true)
    public List<PaymentScheduleDto> getScheduleForVoucher(String voucherType, UUID voucherId) {
        return scheduleRepository.findByVoucherTypeAndVoucherIdOrderByDueDateAsc(voucherType, voucherId).stream()
                .map(this::mapScheduleToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<PaymentScheduleDto> generateScheduleForOrder(UUID salesOrderId) {
        SalesOrder order = salesOrderRepository.findByIdWithDetails(salesOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("SalesOrder", salesOrderId));

        scheduleRepository.deleteByVoucherTypeAndVoucherId("SALES_ORDER", salesOrderId);

        String templateName = order.getPaymentTermsTemplate();
        if (templateName == null || templateName.isBlank()) {
            templateName = "30-50-20 Milestone Schedule";
            order.setPaymentTermsTemplate(templateName);
            salesOrderRepository.save(order);
        }

        PaymentTermsTemplate template = templateRepository.findByNameWithItems(templateName)
                .orElseGet(() -> {
                    seedDefaultTemplates();
                    return templateRepository.findByNameWithItems("30-50-20 Milestone Schedule")
                            .orElse(null);
                });

        if (template == null || template.getItems().isEmpty()) {
            return List.of();
        }

        BigDecimal grandTotal = order.getGrandTotal() != null ? order.getGrandTotal() : BigDecimal.ZERO;
        LocalDate baseDate = order.getTransactionDate() != null ? order.getTransactionDate() : LocalDate.now();

        List<PaymentSchedule> schedules = new ArrayList<>();
        BigDecimal allocatedTotal = BigDecimal.ZERO;

        for (int i = 0; i < template.getItems().size(); i++) {
            PaymentTermsTemplateItem item = template.getItems().get(i);
            BigDecimal amount;

            if (i == template.getItems().size() - 1) {
                // Last item gets remainder to prevent 1-cent rounding drift
                amount = grandTotal.subtract(allocatedTotal);
            } else {
                amount = grandTotal.multiply(item.getInvoicePortion()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                allocatedTotal = allocatedTotal.add(amount);
            }

            LocalDate dueDate = baseDate.plusDays(item.getCreditDays()).plusMonths(item.getCreditMonths());

            PaymentSchedule ps = PaymentSchedule.builder()
                    .voucherType("SALES_ORDER")
                    .voucherId(order.getId())
                    .paymentTerm(item.getPaymentTermName())
                    .description("Milestone portion (" + item.getInvoicePortion() + "%) for " + order.getOrderNumber())
                    .dueDate(dueDate)
                    .invoicePortion(item.getInvoicePortion())
                    .paymentAmount(amount)
                    .paidAmount(BigDecimal.ZERO)
                    .outstandingAmount(amount)
                    .status(PaymentSchedule.ScheduleStatus.UNPAID)
                    .build();

            schedules.add(scheduleRepository.save(ps));
        }

        log.info("Generated {} payment schedule milestones for Sales Order {}", schedules.size(), order.getOrderNumber());
        return schedules.stream().map(this::mapScheduleToDto).collect(Collectors.toList());
    }

    // ==================== MILESTONE INVOICING ====================

    @Transactional
    public SalesInvoiceDto invoiceMilestone(UUID salesOrderId, UUID scheduleId) {
        SalesOrder order = salesOrderRepository.findByIdWithDetails(salesOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("SalesOrder", salesOrderId));

        PaymentSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentSchedule", scheduleId));

        if (schedule.getStatus() == PaymentSchedule.ScheduleStatus.INVOICED) {
            throw new BusinessValidationException("Milestone '" + schedule.getPaymentTerm() + "' has already been invoiced.");
        }

        // Create partial milestone invoice request
        BigDecimal milestoneAmount = schedule.getPaymentAmount();
        BigDecimal milestonePortion = schedule.getInvoicePortion();

        List<SalesInvoiceCreateRequest.InvoiceItemEntry> invoiceItems = new ArrayList<>();
        if (!order.getItems().isEmpty()) {
            SalesOrderItem firstItem = order.getItems().get(0);
            invoiceItems.add(SalesInvoiceCreateRequest.InvoiceItemEntry.builder()
                    .itemId(firstItem.getItemId())
                    .itemCode(firstItem.getItemCode())
                    .itemName(firstItem.getItemName() + " (" + schedule.getPaymentTerm() + " - " + milestonePortion + "%)")
                    .qty(BigDecimal.ONE)
                    .rate(milestoneAmount)
                    .incomeAccount(GeneralLedgerService.ACC_SALES_REVENUE)
                    .build());
        }

        SalesInvoiceCreateRequest invoiceRequest = SalesInvoiceCreateRequest.builder()
                .salesOrderId(order.getId())
                .customerId(order.getCustomerId())
                .customerName(order.getCustomerName())
                .postingDate(LocalDate.now())
                .dueDate(schedule.getDueDate())
                .currency(order.getCurrency() != null ? order.getCurrency() : "INR")
                .conversionRate(order.getConversionRate() != null ? order.getConversionRate() : BigDecimal.ONE)
                .paymentTerms(schedule.getPaymentTerm())
                .salesPartnerId(order.getSalesPartnerId())
                .commissionRate(order.getCommissionRate())
                .items(invoiceItems)
                .build();

        SalesInvoiceDto createdInvoice = salesInvoiceService.createInvoice(invoiceRequest);

        // Update schedule with invoice reference
        schedule.setStatus(PaymentSchedule.ScheduleStatus.INVOICED);
        schedule.setSalesInvoiceId(createdInvoice.getId());
        schedule.setSalesInvoiceNumber(createdInvoice.getInvoiceNumber());
        schedule.setUpdatedAt(OffsetDateTime.now());
        scheduleRepository.save(schedule);

        // Recalculate order perBilled
        List<PaymentSchedule> allMilestones = scheduleRepository.findByVoucherTypeAndVoucherIdOrderByDueDateAsc("SALES_ORDER", salesOrderId);
        BigDecimal invoicedPortionSum = allMilestones.stream()
                .filter(m -> m.getStatus() == PaymentSchedule.ScheduleStatus.INVOICED || m.getStatus() == PaymentSchedule.ScheduleStatus.PAID)
                .map(PaymentSchedule::getInvoicePortion)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setPerBilled(invoicedPortionSum.intValue());
        if (order.getPerBilled() >= 100) {
            order.setBillingStatus(BillingStatus.FULLY_BILLED);
            if (order.getPerDelivered() != null && order.getPerDelivered() >= 100) {
                order.setStatus(SalesOrderStatus.COMPLETED);
            }
        } else if (order.getPerBilled() > 0) {
            order.setBillingStatus(BillingStatus.PARTLY_BILLED);
        }
        salesOrderRepository.save(order);

        log.info("Invoiced milestone '{}' ({}) for Sales Order {}, generated Invoice {}",
                schedule.getPaymentTerm(), schedule.getInvoicePortion(), order.getOrderNumber(), createdInvoice.getInvoiceNumber());

        return createdInvoice;
    }

    // ==================== MAPPERS ====================

    private PaymentTermsTemplateDto mapTemplateToDto(PaymentTermsTemplate t) {
        List<PaymentTermsTemplateDto.TemplateItemDto> items = t.getItems() != null
                ? t.getItems().stream().map(i -> PaymentTermsTemplateDto.TemplateItemDto.builder()
                .id(i.getId())
                .paymentTermName(i.getPaymentTermName())
                .invoicePortion(i.getInvoicePortion())
                .creditDays(i.getCreditDays())
                .creditMonths(i.getCreditMonths())
                .build()).collect(Collectors.toList())
                : List.of();

        return PaymentTermsTemplateDto.builder()
                .id(t.getId())
                .templateName(t.getTemplateName())
                .description(t.getDescription())
                .isActive(t.getIsActive())
                .items(items)
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    private PaymentScheduleDto mapScheduleToDto(PaymentSchedule s) {
        return PaymentScheduleDto.builder()
                .id(s.getId())
                .voucherType(s.getVoucherType())
                .voucherId(s.getVoucherId())
                .paymentTerm(s.getPaymentTerm())
                .description(s.getDescription())
                .dueDate(s.getDueDate())
                .invoicePortion(s.getInvoicePortion())
                .paymentAmount(s.getPaymentAmount())
                .paidAmount(s.getPaidAmount())
                .outstandingAmount(s.getOutstandingAmount())
                .status(s.getStatus())
                .salesInvoiceId(s.getSalesInvoiceId())
                .salesInvoiceNumber(s.getSalesInvoiceNumber())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
