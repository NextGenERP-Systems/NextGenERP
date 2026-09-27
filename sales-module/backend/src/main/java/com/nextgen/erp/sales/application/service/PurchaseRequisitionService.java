package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.PurchaseRequisitionCreateRequest;
import com.nextgen.erp.sales.application.dto.PurchaseRequisitionDto;
import com.nextgen.erp.sales.domain.exception.BusinessValidationException;
import com.nextgen.erp.sales.domain.exception.ResourceNotFoundException;
import com.nextgen.erp.sales.domain.model.*;
import com.nextgen.erp.sales.infrastructure.repository.CustomerAddressRepository;
import com.nextgen.erp.sales.infrastructure.repository.PurchaseRequisitionRepository;
import com.nextgen.erp.sales.infrastructure.repository.SalesOrderItemRepository;
import com.nextgen.erp.sales.infrastructure.repository.SalesOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PurchaseRequisitionService {

    private final PurchaseRequisitionRepository purchaseRequisitionRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final SalesOrderItemRepository salesOrderItemRepository;
    private final CustomerAddressRepository customerAddressRepository;

    @Transactional(readOnly = true)
    public List<PurchaseRequisitionDto> getAllRequisitions() {
        return purchaseRequisitionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PurchaseRequisitionDto> getRequisitionsBySalesOrder(UUID salesOrderId) {
        return purchaseRequisitionRepository.findBySalesOrderIdOrderByCreatedAtDesc(salesOrderId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PurchaseRequisitionDto getRequisitionById(UUID id) {
        PurchaseRequisition pr = purchaseRequisitionRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseRequisition", id));
        return mapToDto(pr);
    }

    @Transactional
    public List<PurchaseRequisitionDto> createFromSalesOrder(UUID salesOrderId) {
        SalesOrder order = salesOrderRepository.findByIdWithDetails(salesOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("SalesOrder", salesOrderId));

        List<SalesOrderItem> dropShipItems = order.getItems().stream()
                .filter(i -> Boolean.TRUE.equals(i.getDeliveredBySupplier()))
                .collect(Collectors.toList());

        if (dropShipItems.isEmpty()) {
            throw new BusinessValidationException("Sales Order " + order.getOrderNumber() + " contains no items flagged for Drop Shipping (delivered_by_supplier).");
        }

        // Group drop-ship items by assigned supplier
        Map<String, List<SalesOrderItem>> itemsBySupplier = new HashMap<>();
        for (SalesOrderItem item : dropShipItems) {
            String supplier = item.getSupplier();
            if (supplier == null || supplier.isBlank()) {
                supplier = "Global Distribution Partner";
            }
            itemsBySupplier.computeIfAbsent(supplier, k -> new ArrayList<>()).add(item);
        }

        // Resolve customer shipping address
        String shippingAddr = "Default Delivery Address";
        List<CustomerAddress> addresses = customerAddressRepository.findByCustomerId(order.getCustomer().getId());
        if (!addresses.isEmpty()) {
            CustomerAddress primary = addresses.stream()
                    .filter(a -> Boolean.TRUE.equals(a.getIsShippingAddress()) || Boolean.TRUE.equals(a.getIsPrimaryAddress()))
                    .findFirst()
                    .orElse(addresses.get(0));
            shippingAddr = primary.getAddressTitle() + ", " + primary.getAddressLine1() + ", " + primary.getCity() + ", " + primary.getCountry();
        }

        List<PurchaseRequisition> createdRequisitions = new ArrayList<>();

        for (Map.Entry<String, List<SalesOrderItem>> entry : itemsBySupplier.entrySet()) {
            String supplierName = entry.getKey();
            List<SalesOrderItem> supplierItems = entry.getValue();

            String reqNumber = generateRequisitionNumber();

            PurchaseRequisition pr = PurchaseRequisition.builder()
                    .requisitionNumber(reqNumber)
                    .salesOrderId(order.getId())
                    .salesOrderNumber(order.getOrderNumber())
                    .customerId(order.getCustomer().getId())
                    .customerName(order.getCustomerName())
                    .shippingAddress(shippingAddr)
                    .supplierName(supplierName)
                    .requisitionType("DROP_SHIP")
                    .status(PurchaseRequisition.RequisitionStatus.DRAFT)
                    .transactionDate(LocalDate.now())
                    .requiredDate(order.getDeliveryDate())
                    .notes("Auto-generated Drop Ship Purchase Requisition for Sales Order " + order.getOrderNumber())
                    .items(new ArrayList<>())
                    .build();

            BigDecimal totalQty = BigDecimal.ZERO;
            BigDecimal netTotal = BigDecimal.ZERO;

            for (SalesOrderItem soItem : supplierItems) {
                BigDecimal itemRate = soItem.getValuationRate() != null && soItem.getValuationRate().compareTo(BigDecimal.ZERO) > 0
                        ? soItem.getValuationRate()
                        : soItem.getRate();
                BigDecimal amount = soItem.getQty().multiply(itemRate);

                PurchaseRequisitionItem pri = PurchaseRequisitionItem.builder()
                        .purchaseRequisition(pr)
                        .salesOrderItemId(soItem.getId())
                        .item(soItem.getItem())
                        .itemCode(soItem.getItemCode())
                        .itemName(soItem.getItemName())
                        .qty(soItem.getQty())
                        .rate(itemRate)
                        .amount(amount)
                        .uom(soItem.getUom() != null ? soItem.getUom() : "Nos")
                        .supplierName(supplierName)
                        .build();

                pr.getItems().add(pri);
                totalQty = totalQty.add(soItem.getQty());
                netTotal = netTotal.add(amount);
            }

            pr.setTotalQty(totalQty);
            pr.setNetTotal(netTotal);

            PurchaseRequisition saved = purchaseRequisitionRepository.save(pr);
            createdRequisitions.add(saved);
            log.info("Created Drop Ship Requisition {} for supplier {}", reqNumber, supplierName);
        }

        return createdRequisitions.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public PurchaseRequisitionDto createRequisition(PurchaseRequisitionCreateRequest request) {
        String reqNumber = generateRequisitionNumber();

        PurchaseRequisition pr = PurchaseRequisition.builder()
                .requisitionNumber(reqNumber)
                .salesOrderId(request.getSalesOrderId())
                .salesOrderNumber(request.getSalesOrderNumber())
                .customerId(request.getCustomerId())
                .customerName(request.getCustomerName())
                .shippingAddress(request.getShippingAddress())
                .supplierName(request.getSupplierName())
                .requisitionType(request.getRequisitionType() != null ? request.getRequisitionType() : "DROP_SHIP")
                .status(PurchaseRequisition.RequisitionStatus.DRAFT)
                .transactionDate(LocalDate.now())
                .requiredDate(request.getRequiredDate() != null ? request.getRequiredDate() : LocalDate.now().plusDays(7))
                .notes(request.getNotes())
                .items(new ArrayList<>())
                .build();

        BigDecimal totalQty = BigDecimal.ZERO;
        BigDecimal netTotal = BigDecimal.ZERO;

        for (PurchaseRequisitionCreateRequest.RequisitionItemRequest itemReq : request.getItems()) {
            BigDecimal qty = itemReq.getQty() != null ? itemReq.getQty() : BigDecimal.ONE;
            BigDecimal rate = itemReq.getRate() != null ? itemReq.getRate() : BigDecimal.ZERO;
            BigDecimal amount = qty.multiply(rate);

            PurchaseRequisitionItem pri = PurchaseRequisitionItem.builder()
                    .purchaseRequisition(pr)
                    .salesOrderItemId(itemReq.getSalesOrderItemId())
                    .itemCode(itemReq.getItemCode())
                    .itemName(itemReq.getItemName())
                    .qty(qty)
                    .rate(rate)
                    .amount(amount)
                    .uom(itemReq.getUom() != null ? itemReq.getUom() : "Nos")
                    .supplierName(itemReq.getSupplierName() != null ? itemReq.getSupplierName() : request.getSupplierName())
                    .build();

            pr.getItems().add(pri);
            totalQty = totalQty.add(qty);
            netTotal = netTotal.add(amount);
        }

        pr.setTotalQty(totalQty);
        pr.setNetTotal(netTotal);

        PurchaseRequisition saved = purchaseRequisitionRepository.save(pr);
        return mapToDto(saved);
    }

    @Transactional
    public PurchaseRequisitionDto submitRequisition(UUID id) {
        PurchaseRequisition pr = purchaseRequisitionRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseRequisition", id));

        pr.setStatus(PurchaseRequisition.RequisitionStatus.SUBMITTED);
        pr.setUpdatedAt(OffsetDateTime.now());
        return mapToDto(purchaseRequisitionRepository.save(pr));
    }

    @Transactional
    public PurchaseRequisitionDto orderFromSupplier(UUID id) {
        PurchaseRequisition pr = purchaseRequisitionRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseRequisition", id));

        pr.setStatus(PurchaseRequisition.RequisitionStatus.ORDERED);
        pr.setUpdatedAt(OffsetDateTime.now());
        return mapToDto(purchaseRequisitionRepository.save(pr));
    }

    @Transactional
    public PurchaseRequisitionDto confirmDelivery(UUID id) {
        PurchaseRequisition pr = purchaseRequisitionRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseRequisition", id));

        pr.setStatus(PurchaseRequisition.RequisitionStatus.DELIVERED);
        pr.setUpdatedAt(OffsetDateTime.now());
        PurchaseRequisition saved = purchaseRequisitionRepository.save(pr);

        // If linked to a Sales Order, update delivered quantity on corresponding Sales Order Item
        if (pr.getSalesOrderId() != null) {
            salesOrderRepository.findByIdWithDetails(pr.getSalesOrderId()).ifPresent(order -> {
                for (PurchaseRequisitionItem pri : pr.getItems()) {
                    if (pri.getSalesOrderItemId() != null) {
                        for (SalesOrderItem soItem : order.getItems()) {
                            if (soItem.getId().equals(pri.getSalesOrderItemId())) {
                                soItem.setDeliveredQty(soItem.getQty());
                                salesOrderItemRepository.save(soItem);
                            }
                        }
                    }
                }

                // Recalculate order delivery percentage
                BigDecimal totalOrdered = order.getTotalQty() != null ? order.getTotalQty() : BigDecimal.ZERO;
                BigDecimal totalDelivered = order.getItems().stream()
                        .map(i -> i.getDeliveredQty() != null ? i.getDeliveredQty() : BigDecimal.ZERO)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal perDelivered = totalOrdered.compareTo(BigDecimal.ZERO) > 0
                        ? totalDelivered.divide(totalOrdered, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;

                order.setPerDelivered(perDelivered);
                if (perDelivered.compareTo(new BigDecimal("100.00")) >= 0) {
                    order.setDeliveryStatus(DeliveryStatus.FULLY_DELIVERED);
                    if (order.getPerBilled() != null && order.getPerBilled().compareTo(new BigDecimal("100.00")) >= 0) {
                        order.setStatus(SalesOrderStatus.COMPLETED);
                    }
                } else if (perDelivered.compareTo(BigDecimal.ZERO) > 0) {
                    order.setDeliveryStatus(DeliveryStatus.PARTIALLY_DELIVERED);
                }

                salesOrderRepository.save(order);
                log.info("Updated Sales Order {} delivery fulfillment to {}% following Drop Ship receipt", order.getOrderNumber(), perDelivered);
            });
        }

        return mapToDto(saved);
    }

    @Transactional
    public PurchaseRequisitionDto cancelRequisition(UUID id) {
        PurchaseRequisition pr = purchaseRequisitionRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseRequisition", id));

        pr.setStatus(PurchaseRequisition.RequisitionStatus.CANCELLED);
        pr.setUpdatedAt(OffsetDateTime.now());
        return mapToDto(purchaseRequisitionRepository.save(pr));
    }

    private String generateRequisitionNumber() {
        return "PREQ-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    public PurchaseRequisitionDto mapToDto(PurchaseRequisition pr) {
        List<PurchaseRequisitionDto.RequisitionItemDto> itemDtos = pr.getItems() != null
                ? pr.getItems().stream().map(i -> PurchaseRequisitionDto.RequisitionItemDto.builder()
                .id(i.getId())
                .salesOrderItemId(i.getSalesOrderItemId())
                .itemId(i.getItem() != null ? i.getItem().getId() : null)
                .itemCode(i.getItemCode())
                .itemName(i.getItemName())
                .qty(i.getQty())
                .rate(i.getRate())
                .amount(i.getAmount())
                .uom(i.getUom())
                .supplierName(i.getSupplierName())
                .build()).collect(Collectors.toList())
                : new ArrayList<>();

        return PurchaseRequisitionDto.builder()
                .id(pr.getId())
                .requisitionNumber(pr.getRequisitionNumber())
                .salesOrderId(pr.getSalesOrderId())
                .salesOrderNumber(pr.getSalesOrderNumber())
                .customerId(pr.getCustomerId())
                .customerName(pr.getCustomerName())
                .shippingAddress(pr.getShippingAddress())
                .supplierName(pr.getSupplierName())
                .requisitionType(pr.getRequisitionType())
                .status(pr.getStatus())
                .transactionDate(pr.getTransactionDate())
                .requiredDate(pr.getRequiredDate())
                .totalQty(pr.getTotalQty())
                .netTotal(pr.getNetTotal())
                .notes(pr.getNotes())
                .items(itemDtos)
                .createdAt(pr.getCreatedAt())
                .updatedAt(pr.getUpdatedAt())
                .build();
    }
}
