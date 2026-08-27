package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.*;
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
public class DeliveryNoteService {

    private final DeliveryNoteRepository deliveryNoteRepository;
    private final CustomerRepository customerRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final ItemRepository itemRepository;

    @Transactional(readOnly = true)
    public List<DeliveryNoteDto> getAllDeliveryNotes() {
        return deliveryNoteRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DeliveryNoteDto getDeliveryNoteById(UUID id) {
        DeliveryNote dn = deliveryNoteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery Note not found with id: " + id));
        return toDto(dn);
    }

    @Transactional
    public DeliveryNoteDto createDeliveryNote(DeliveryNoteCreateRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + request.getCustomerId()));

        String dnNumber = generateDeliveryNoteNumber();

        DeliveryNote deliveryNote = DeliveryNote.builder()
                .deliveryNoteNumber(dnNumber)
                .salesOrderId(request.getSalesOrderId())
                .customer(customer)
                .customerName(customer.getCustomerName())
                .postingDate(request.getPostingDate() != null ? request.getPostingDate() : LocalDate.now())
                .status(DeliveryNoteStatus.SUBMITTED)
                .carrier(request.getCarrier())
                .trackingNumber(request.getTrackingNumber())
                .shippingAddress(request.getShippingAddress())
                .notes(request.getNotes())
                .items(new ArrayList<>())
                .build();

        BigDecimal totalQty = BigDecimal.ZERO;
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (DeliveryNoteCreateRequest.ItemEntry itemEntry : request.getItems()) {
            Item item = null;
            if (itemEntry.getItemId() != null) {
                item = itemRepository.findById(itemEntry.getItemId()).orElse(null);
            }

            BigDecimal qty = itemEntry.getQty() != null ? itemEntry.getQty() : BigDecimal.ONE;
            BigDecimal rate = itemEntry.getRate() != null ? itemEntry.getRate() : BigDecimal.ZERO;
            BigDecimal lineAmount = qty.multiply(rate);

            DeliveryNoteItem dnItem = DeliveryNoteItem.builder()
                    .deliveryNote(deliveryNote)
                    .salesOrderItemId(itemEntry.getSalesOrderItemId())
                    .item(item)
                    .itemCode(itemEntry.getItemCode())
                    .itemName(itemEntry.getItemName())
                    .qty(qty)
                    .uom(itemEntry.getUom() != null ? itemEntry.getUom() : "Nos")
                    .rate(rate)
                    .amount(lineAmount)
                    .warehouse(itemEntry.getWarehouse() != null ? itemEntry.getWarehouse() : "Stores - Default")
                    .build();

            deliveryNote.getItems().add(dnItem);
            totalQty = totalQty.add(qty);
            totalAmount = totalAmount.add(lineAmount);
        }

        deliveryNote.setTotalQty(totalQty);
        deliveryNote.setTotalAmount(totalAmount);

        DeliveryNote saved = deliveryNoteRepository.save(deliveryNote);

        // Update parent Sales Order fulfilment status
        if (request.getSalesOrderId() != null) {
            updateParentSalesOrderFulfilment(request.getSalesOrderId());
        }

        log.info("Created Delivery Note {} for customer {}", saved.getDeliveryNoteNumber(), saved.getCustomerName());
        return toDto(saved);
    }

    @Transactional
    public DeliveryNoteDto makeFromSalesOrder(UUID salesOrderId) {
        SalesOrder so = salesOrderRepository.findById(salesOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Sales Order not found: " + salesOrderId));

        List<DeliveryNoteCreateRequest.ItemEntry> itemEntries = so.getItems().stream()
                .map(item -> DeliveryNoteCreateRequest.ItemEntry.builder()
                        .salesOrderItemId(item.getId())
                        .itemId(item.getItem() != null ? item.getItem().getId() : null)
                        .itemCode(item.getItemCode())
                        .itemName(item.getItemName())
                        .qty(item.getQty())
                        .uom("Nos")
                        .rate(item.getRate())
                        .warehouse(item.getWarehouse() != null ? item.getWarehouse() : "Stores - Default")
                        .build())
                .collect(Collectors.toList());

        DeliveryNoteCreateRequest request = DeliveryNoteCreateRequest.builder()
                .salesOrderId(so.getId())
                .customerId(so.getCustomer().getId())
                .postingDate(LocalDate.now())
                .shippingAddress(so.getCustomer().getCustomerName())
                .notes("Generated from Sales Order: " + so.getOrderNumber())
                .items(itemEntries)
                .build();

        return createDeliveryNote(request);
    }

    @Transactional
    public void updateParentSalesOrderFulfilment(UUID salesOrderId) {
        SalesOrder so = salesOrderRepository.findById(salesOrderId).orElse(null);
        if (so == null) return;

        List<DeliveryNote> deliveryNotes = deliveryNoteRepository.findBySalesOrderId(salesOrderId);
        List<DeliveryNote> activeNotes = deliveryNotes.stream()
                .filter(dn -> dn.getStatus() == DeliveryNoteStatus.SUBMITTED || dn.getStatus() == DeliveryNoteStatus.COMPLETED)
                .collect(Collectors.toList());

        BigDecimal totalDeliveredQty = BigDecimal.ZERO;
        for (DeliveryNote dn : activeNotes) {
            for (DeliveryNoteItem item : dn.getItems()) {
                totalDeliveredQty = totalDeliveredQty.add(item.getQty());
            }
        }

        BigDecimal totalOrderQty = so.getItems().stream()
                .map(SalesOrderItem::getQty)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal perDelivered = BigDecimal.ZERO;
        if (totalOrderQty.compareTo(BigDecimal.ZERO) > 0) {
            perDelivered = totalDeliveredQty.divide(totalOrderQty, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100.00"))
                    .setScale(2, RoundingMode.HALF_UP);
            if (perDelivered.compareTo(new BigDecimal("100.00")) > 0) {
                perDelivered = new BigDecimal("100.00");
            }
        }

        so.setPerDelivered(perDelivered);

        if (perDelivered.compareTo(BigDecimal.ZERO) == 0) {
            so.setDeliveryStatus(DeliveryStatus.NOT_DELIVERED);
        } else if (perDelivered.compareTo(new BigDecimal("100.00")) >= 0) {
            so.setDeliveryStatus(DeliveryStatus.FULLY_DELIVERED);
        } else {
            so.setDeliveryStatus(DeliveryStatus.PARTLY_DELIVERED);
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
        log.info("Updated Sales Order {} fulfillment: perDelivered={}%, status={}", so.getOrderNumber(), perDelivered, so.getStatus());
    }

    private String generateDeliveryNoteNumber() {
        long count = deliveryNoteRepository.count() + 1;
        return String.format("DN-%d-%04d", LocalDate.now().getYear(), count);
    }

    public DeliveryNoteDto toDto(DeliveryNote dn) {
        List<DeliveryNoteItemDto> itemDtos = dn.getItems().stream()
                .map(item -> DeliveryNoteItemDto.builder()
                        .id(item.getId())
                        .salesOrderItemId(item.getSalesOrderItemId())
                        .itemId(item.getItem() != null ? item.getItem().getId() : null)
                        .itemCode(item.getItemCode())
                        .itemName(item.getItemName())
                        .qty(item.getQty())
                        .uom(item.getUom())
                        .rate(item.getRate())
                        .amount(item.getAmount())
                        .warehouse(item.getWarehouse())
                        .build())
                .collect(Collectors.toList());

        BigDecimal totalAmount = dn.getTotalAmount() != null ? dn.getTotalAmount() : BigDecimal.ZERO;
        String inWords = NumberToWordsConverter.convert(totalAmount, "INR");

        return DeliveryNoteDto.builder()
                .id(dn.getId())
                .deliveryNoteNumber(dn.getDeliveryNoteNumber())
                .salesOrderId(dn.getSalesOrderId())
                .customerId(dn.getCustomer().getId())
                .customerName(dn.getCustomerName())
                .postingDate(dn.getPostingDate())
                .status(dn.getStatus())
                .carrier(dn.getCarrier())
                .trackingNumber(dn.getTrackingNumber())
                .shippingAddress(dn.getShippingAddress())
                .totalQty(dn.getTotalQty())
                .totalAmount(totalAmount)
                .inWords(inWords)
                .notes(dn.getNotes())
                .items(itemDtos)
                .createdAt(dn.getCreatedAt())
                .updatedAt(dn.getUpdatedAt())
                .build();
    }
}
