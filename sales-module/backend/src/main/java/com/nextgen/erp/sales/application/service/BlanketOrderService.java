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

    private String generateBlanketOrderNumber() {
        long count = blanketOrderRepository.count() + 1;
        return String.format("BO-%d-%04d", LocalDate.now().getYear(), count);
    }

    public BlanketOrderDto mapToDto(BlanketOrder bo) {
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
                .createdAt(bo.getCreatedAt())
                .items(bo.getItems() != null ? bo.getItems().stream().map(i -> BlanketOrderDto.BlanketOrderItemDto.builder()
                        .id(i.getId())
                        .itemId(i.getItem() != null ? i.getItem().getId() : null)
                        .itemCode(i.getItemCode())
                        .itemName(i.getItemName())
                        .qty(i.getQty())
                        .rate(i.getRate())
                        .orderedQty(i.getOrderedQty())
                        .remainingQty(i.getRemainingQty())
                        .build()).collect(Collectors.toList()) : List.of())
                .build();
    }
}
