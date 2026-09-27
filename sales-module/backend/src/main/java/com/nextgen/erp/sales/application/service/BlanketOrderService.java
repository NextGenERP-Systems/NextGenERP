package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.BlanketOrderCreateRequest;
import com.nextgen.erp.sales.application.dto.BlanketOrderDto;
import com.nextgen.erp.sales.domain.exception.ResourceNotFoundException;
import com.nextgen.erp.sales.domain.model.BlanketOrder;
import com.nextgen.erp.sales.domain.model.BlanketOrder.BlanketOrderStatus;
import com.nextgen.erp.sales.domain.model.BlanketOrderItem;
import com.nextgen.erp.sales.domain.model.Customer;
import com.nextgen.erp.sales.domain.model.Item;
import com.nextgen.erp.sales.infrastructure.repository.BlanketOrderRepository;
import com.nextgen.erp.sales.infrastructure.repository.CustomerRepository;
import com.nextgen.erp.sales.infrastructure.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BlanketOrderService {

    private final BlanketOrderRepository blanketOrderRepository;
    private final CustomerRepository customerRepository;
    private final ItemRepository itemRepository;

    @Transactional(readOnly = true)
    public List<BlanketOrderDto> getAllBlanketOrders() {
        return blanketOrderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BlanketOrderDto getBlanketOrderById(UUID id) {
        BlanketOrder bo = blanketOrderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("BlanketOrder", id));
        return mapToDto(bo);
    }

    @Transactional
    public BlanketOrderDto createBlanketOrder(BlanketOrderCreateRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));

        String boNumber = generateBlanketOrderNumber();

        BlanketOrder bo = BlanketOrder.builder()
                .blanketOrderNumber(boNumber)
                .customer(customer)
                .customerName(customer.getCustomerName())
                .fromDate(request.getFromDate())
                .toDate(request.getToDate())
                .status(BlanketOrderStatus.ACTIVE)
                .termsAndConditions(request.getTermsAndConditions())
                .items(new ArrayList<>())
                .build();

        for (BlanketOrderCreateRequest.ItemEntry itemReq : request.getItems()) {
            Item item = null;
            if (itemReq.getItemId() != null) {
                item = itemRepository.findById(itemReq.getItemId()).orElse(null);
            }

            BlanketOrderItem boItem = BlanketOrderItem.builder()
                    .blanketOrder(bo)
                    .item(item)
                    .itemCode(itemReq.getItemCode())
                    .itemName(itemReq.getItemName())
                    .qty(itemReq.getQty() != null ? itemReq.getQty() : BigDecimal.ONE)
                    .rate(itemReq.getRate() != null ? itemReq.getRate() : BigDecimal.ZERO)
                    .orderedQty(BigDecimal.ZERO)
                    .build();

            bo.getItems().add(boItem);
        }

        BlanketOrder saved = blanketOrderRepository.save(bo);
        log.info("Created Blanket Order {} for customer {}", saved.getBlanketOrderNumber(), saved.getCustomerName());
        return mapToDto(saved);
    }

    @Transactional
    public BlanketOrderDto closeBlanketOrder(UUID id) {
        BlanketOrder bo = blanketOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BlanketOrder", id));
        bo.setStatus(BlanketOrderStatus.CLOSED);
        BlanketOrder saved = blanketOrderRepository.save(bo);
        return mapToDto(saved);
    }

    @Transactional
    public void updateOrderedQuantity(UUID blanketOrderId, String itemCode, BigDecimal qty) {
        if (blanketOrderId == null || qty == null || qty.compareTo(BigDecimal.ZERO) <= 0) return;
        BlanketOrder bo = blanketOrderRepository.findByIdWithItems(blanketOrderId).orElse(null);
        if (bo == null) return;

        boolean updated = false;
        if (bo.getItems() != null) {
            for (BlanketOrderItem item : bo.getItems()) {
                if (item.getItemCode() != null && item.getItemCode().equalsIgnoreCase(itemCode)) {
                    BigDecimal current = item.getOrderedQty() != null ? item.getOrderedQty() : BigDecimal.ZERO;
                    item.setOrderedQty(current.add(qty));
                    updated = true;
                    break;
                }
            }
        }
        if (updated) {
            bo.recalculateFulfillment();
            blanketOrderRepository.save(bo);
            log.info("Updated orderedQty on BlanketOrder {} for item {}: +{}", bo.getBlanketOrderNumber(), itemCode, qty);
        }
    }

    @Transactional
    public void revertOrderedQuantity(UUID blanketOrderId, String itemCode, BigDecimal qty) {
        if (blanketOrderId == null || qty == null || qty.compareTo(BigDecimal.ZERO) <= 0) return;
        BlanketOrder bo = blanketOrderRepository.findByIdWithItems(blanketOrderId).orElse(null);
        if (bo == null) return;

        boolean updated = false;
        if (bo.getItems() != null) {
            for (BlanketOrderItem item : bo.getItems()) {
                if (item.getItemCode() != null && item.getItemCode().equalsIgnoreCase(itemCode)) {
                    BigDecimal current = item.getOrderedQty() != null ? item.getOrderedQty() : BigDecimal.ZERO;
                    BigDecimal next = current.subtract(qty);
                    item.setOrderedQty(next.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : next);
                    updated = true;
                    break;
                }
            }
        }
        if (updated) {
            bo.recalculateFulfillment();
            blanketOrderRepository.save(bo);
            log.info("Reverted orderedQty on BlanketOrder {} for item {}: -{}", bo.getBlanketOrderNumber(), itemCode, qty);
        }
    }

    private String generateBlanketOrderNumber() {
        long count = blanketOrderRepository.count() + 1;
        return String.format("BO-%d-%04d", LocalDate.now().getYear(), count);
    }

    public BlanketOrderDto mapToDto(BlanketOrder bo) {
        BigDecimal totalQty = BigDecimal.ZERO;
        BigDecimal totalOrdered = BigDecimal.ZERO;
        BigDecimal totalRemaining = BigDecimal.ZERO;

        List<BlanketOrderDto.BlanketOrderItemDto> itemDtos = new ArrayList<>();
        if (bo.getItems() != null) {
            for (BlanketOrderItem i : bo.getItems()) {
                BigDecimal q = i.getQty() != null ? i.getQty() : BigDecimal.ZERO;
                BigDecimal o = i.getOrderedQty() != null ? i.getOrderedQty() : BigDecimal.ZERO;
                BigDecimal r = i.getRemainingQty() != null ? i.getRemainingQty() : BigDecimal.ZERO;
                totalQty = totalQty.add(q);
                totalOrdered = totalOrdered.add(o);
                totalRemaining = totalRemaining.add(r);

                itemDtos.add(BlanketOrderDto.BlanketOrderItemDto.builder()
                        .id(i.getId())
                        .itemId(i.getItem() != null ? i.getItem().getId() : null)
                        .itemCode(i.getItemCode())
                        .itemName(i.getItemName())
                        .qty(q)
                        .rate(i.getRate())
                        .orderedQty(o)
                        .remainingQty(r)
                        .build());
            }
        }

        BigDecimal fulfillmentPct = BigDecimal.ZERO;
        if (totalQty.compareTo(BigDecimal.ZERO) > 0) {
            fulfillmentPct = totalOrdered.multiply(BigDecimal.valueOf(100))
                    .divide(totalQty, 2, java.math.RoundingMode.HALF_UP);
            if (fulfillmentPct.compareTo(BigDecimal.valueOf(100)) > 0) {
                fulfillmentPct = BigDecimal.valueOf(100);
            }
        }

        return BlanketOrderDto.builder()
                .id(bo.getId())
                .blanketOrderNumber(bo.getBlanketOrderNumber())
                .customerId(bo.getCustomer() != null ? bo.getCustomer().getId() : null)
                .customerName(bo.getCustomerName())
                .fromDate(bo.getFromDate())
                .toDate(bo.getToDate())
                .company(bo.getCompany())
                .status(bo.getStatus())
                .termsAndConditions(bo.getTermsAndConditions())
                .totalQty(totalQty)
                .totalOrderedQty(totalOrdered)
                .totalRemainingQty(totalRemaining)
                .fulfillmentPercentage(fulfillmentPct)
                .createdAt(bo.getCreatedAt())
                .items(itemDtos)
                .build();
    }
}
