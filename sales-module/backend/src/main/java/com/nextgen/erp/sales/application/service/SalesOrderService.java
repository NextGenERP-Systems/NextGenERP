package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.*;
import com.nextgen.erp.sales.domain.engine.CommissionEngine;
import com.nextgen.erp.sales.domain.engine.CreditLimitValidator;
import com.nextgen.erp.sales.domain.engine.PricingEngine;
import com.nextgen.erp.sales.domain.engine.TaxCalculationEngine;
import com.nextgen.erp.sales.domain.exception.BusinessValidationException;
import com.nextgen.erp.sales.domain.exception.ResourceNotFoundException;
import com.nextgen.erp.sales.domain.model.*;
import com.nextgen.erp.sales.infrastructure.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;
    private final CustomerRepository customerRepository;
    private final ItemRepository itemRepository;
    private final QuotationRepository quotationRepository;
    private final SalesTaxAndChargeRepository taxRepository;
    private final SalesTeamMemberRepository salesTeamRepository;
    private final StockReservationRepository stockReservationRepository;
    private final PricingEngine pricingEngine;
    private final TaxCalculationEngine taxCalculationEngine;
    private final CreditLimitValidator creditLimitValidator;
    private final CommissionEngine commissionEngine;
    private final PricingRuleEngine pricingRuleEngine;
    private final BlanketOrderRepository blanketOrderRepository;
    private final BlanketOrderService blanketOrderService;
    private final SalesPartnerRepository salesPartnerRepository;
    private final SalesPartnerService salesPartnerService;

    @Transactional(readOnly = true)
    public List<SalesOrderDto> getAllSalesOrders() {
        return salesOrderRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalesOrderDto getSalesOrderById(UUID id) {
        SalesOrder order = salesOrderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesOrder", id));
        return mapToDto(order);
    }

    @Transactional
    public SalesOrderDto createSalesOrder(SalesOrderCreateRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));

        String ordNumber = request.getOrderNumber();
        if (ordNumber == null || ordNumber.isBlank()) {
            ordNumber = "SAL-ORD-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }

        BlanketOrder linkedBlanketOrder = null;
        if (request.getBlanketOrderId() != null) {
            linkedBlanketOrder = blanketOrderRepository.findByIdWithItems(request.getBlanketOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("BlanketOrder", request.getBlanketOrderId()));
            if (linkedBlanketOrder.getStatus() == BlanketOrder.BlanketOrderStatus.CLOSED ||
                linkedBlanketOrder.getStatus() == BlanketOrder.BlanketOrderStatus.EXPIRED) {
                throw new BusinessValidationException("Cannot release order against a " + linkedBlanketOrder.getStatus() + " Blanket Order");
            }
        }

        UUID partnerId = request.getSalesPartnerId();
        String partnerName = request.getSalesPartnerName();
        BigDecimal commRate = request.getCommissionRate();

        if (partnerId != null) {
            Optional<SalesPartner> spOpt = salesPartnerRepository.findById(partnerId);
            if (spOpt.isPresent()) {
                partnerName = spOpt.get().getPartnerName();
                if (commRate == null || commRate.compareTo(BigDecimal.ZERO) == 0) {
                    commRate = spOpt.get().getCommissionRate();
                }
            }
        } else if (customer.getDefaultSalesPartner() != null && !customer.getDefaultSalesPartner().isBlank()) {
            Optional<SalesPartner> spOpt = salesPartnerRepository.findByPartnerName(customer.getDefaultSalesPartner());
            if (spOpt.isPresent()) {
                partnerId = spOpt.get().getId();
                partnerName = spOpt.get().getPartnerName();
                if (commRate == null || commRate.compareTo(BigDecimal.ZERO) == 0) {
                    commRate = spOpt.get().getCommissionRate();
                }
            }
        }

        SalesOrder order = SalesOrder.builder()
                .orderNumber(ordNumber)
                .transactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDate.now())
                .deliveryDate(request.getDeliveryDate())
                .poNo(request.getPoNo())
                .poDate(request.getPoDate())
                .customer(customer)
                .customerName(customer.getCustomerName())
                .orderType(request.getOrderType() != null ? request.getOrderType() : OrderType.SALES)
                .status(SalesOrderStatus.DRAFT)
                .deliveryStatus(DeliveryStatus.NOT_DELIVERED)
                .billingStatus(BillingStatus.NOT_BILLED)
                .quotationId(request.getQuotationId())
                .blanketOrderId(linkedBlanketOrder != null ? linkedBlanketOrder.getId() : null)
                .blanketOrderNumber(linkedBlanketOrder != null ? linkedBlanketOrder.getBlanketOrderNumber() : null)
                .salesPartnerId(partnerId)
                .salesPartnerName(partnerName)
                .currency(request.getCurrency())
                .conversionRate(request.getConversionRate())
                .sellingPriceListId(request.getSellingPriceListId())
                .additionalDiscountPercentage(request.getAdditionalDiscountPercentage())
                .discountAmount(request.getDiscountAmount())
                .applyDiscountOn(request.getApplyDiscountOn())
                .reserveStock(Boolean.TRUE.equals(request.getReserveStock()))
                .skipDeliveryNote(Boolean.TRUE.equals(request.getSkipDeliveryNote()))
                .paymentTermsTemplate(request.getPaymentTermsTemplate())
                .termsAndConditions(request.getTermsAndConditions())
                .commissionRate(commRate != null ? commRate : BigDecimal.ZERO)
                .items(new ArrayList<>())
                .paymentSchedules(new ArrayList<>())
                .stockReservations(new ArrayList<>())
                .build();

        // 1. Process Order Items
        BigDecimal totalQty = BigDecimal.ZERO;
        BigDecimal netTotal = BigDecimal.ZERO;
        List<SalesOrderItem> freeItemsToInject = new ArrayList<>();

        for (int i = 0; i < request.getItems().size(); i++) {
            SalesOrderCreateRequest.OrderItemRequest itemReq = request.getItems().get(i);
            Item item = itemRepository.findById(itemReq.getItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Item", itemReq.getItemId()));

            BigDecimal priceListRate = itemReq.getPriceListRate() != null ? itemReq.getPriceListRate() : item.getStandardRate();

            // Contractual Rate Override: If ordered against Blanket Order, lock to agreed contract rate
            if (linkedBlanketOrder != null && linkedBlanketOrder.getItems() != null) {
                for (BlanketOrderItem boItem : linkedBlanketOrder.getItems()) {
                    if (boItem.getItemCode() != null && boItem.getItemCode().equalsIgnoreCase(item.getItemCode())) {
                        priceListRate = boItem.getRate();
                        break;
                    }
                }
            }

            BigDecimal discountPct = itemReq.getDiscountPercentage() != null ? itemReq.getDiscountPercentage() : BigDecimal.ZERO;
            BigDecimal discountAmt = itemReq.getDiscountAmount() != null ? itemReq.getDiscountAmount() : BigDecimal.ZERO;

            // Wire Pricing Rules: Auto-lookup volume/promotional pricing rule if no manual discount provided
            if (discountPct.compareTo(BigDecimal.ZERO) == 0 && discountAmt.compareTo(BigDecimal.ZERO) == 0) {
                Optional<PricingRule> rule = pricingRuleEngine.findBestRule(item.getItemCode(), item.getItemGroup(), itemReq.getQty());
                if (rule.isPresent()) {
                    if (rule.get().getDiscountPercentage() != null && rule.get().getDiscountPercentage().compareTo(BigDecimal.ZERO) > 0) {
                        discountPct = rule.get().getDiscountPercentage();
                    } else if (rule.get().getDiscountAmount() != null && rule.get().getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                        discountAmt = rule.get().getDiscountAmount();
                    }
                }
            }

            // Check for Free-Item Promotional Rule
            Optional<PricingRule> freeRule = pricingRuleEngine.findFreeItemRule(item.getItemCode(), item.getItemGroup(), itemReq.getQty());
            if (freeRule.isPresent()) {
                PricingRule fRule = freeRule.get();
                Optional<Item> optFreeItem = itemRepository.findByItemCode(fRule.getFreeItemCode());
                if (optFreeItem.isPresent()) {
                    Item fItem = optFreeItem.get();
                    SalesOrderItem freeOrderItem = SalesOrderItem.builder()
                            .salesOrder(order)
                            .item(fItem)
                            .itemCode(fItem.getItemCode())
                            .itemName(fItem.getItemName())
                            .description("[PROMO - " + fRule.getTitle() + "] Free " + fItem.getItemName())
                            .warehouse(itemReq.getWarehouse() != null ? itemReq.getWarehouse() : "Stores - Default")
                            .deliveryDate(itemReq.getDeliveryDate() != null ? itemReq.getDeliveryDate() : order.getDeliveryDate())
                            .qty(fRule.getFreeQty() != null ? fRule.getFreeQty() : BigDecimal.ONE)
                            .stockUom(fItem.getStockUom())
                            .uom(fItem.getStockUom())
                            .conversionFactor(BigDecimal.ONE)
                            .stockQty(fRule.getFreeQty() != null ? fRule.getFreeQty() : BigDecimal.ONE)
                            .priceListRate(BigDecimal.ZERO)
                            .discountPercentage(BigDecimal.ZERO)
                            .discountAmount(BigDecimal.ZERO)
                            .rate(BigDecimal.ZERO)
                            .baseRate(BigDecimal.ZERO)
                            .amount(BigDecimal.ZERO)
                            .baseAmount(BigDecimal.ZERO)
                            .netRate(BigDecimal.ZERO)
                            .netAmount(BigDecimal.ZERO)
                            .baseNetAmount(BigDecimal.ZERO)
                            .valuationRate(BigDecimal.ZERO)
                            .grossProfit(BigDecimal.ZERO)
                            .deliveredQty(BigDecimal.ZERO)
                            .billedAmt(BigDecimal.ZERO)
                            .pickedQty(BigDecimal.ZERO)
                            .deliveredBySupplier(false)
                            .grantCommission(false)
                            .build();
                    freeItemsToInject.add(freeOrderItem);
                }
            }

            PricingEngine.ItemPricingResult itemCalc = pricingEngine.calculateItemPricing(
                    itemReq.getQty(),
                    BigDecimal.ONE,
                    priceListRate,
                    discountPct,
                    discountAmt,
                    order.getConversionRate(),
                    item.getValuationRate()
            );

            SalesOrderItem orderItem = SalesOrderItem.builder()
                    .salesOrder(order)
                    .idx(i + 1)
                    .item(item)
                    .itemCode(item.getItemCode())
                    .itemName(item.getItemName())
                    .description(itemReq.getDescription() != null ? itemReq.getDescription() : item.getItemName())
                    .warehouse(itemReq.getWarehouse() != null ? itemReq.getWarehouse() : "Stores - Default")
                    .deliveryDate(itemReq.getDeliveryDate() != null ? itemReq.getDeliveryDate() : order.getDeliveryDate())
                    .qty(itemReq.getQty() != null ? itemReq.getQty() : BigDecimal.ONE)
                    .stockUom(item.getStockUom())
                    .uom(item.getStockUom())
                    .conversionFactor(BigDecimal.ONE)
                    .stockQty(itemCalc.stockQty())
                    .priceListRate(priceListRate)
                    .discountPercentage(discountPct)
                    .discountAmount(discountAmt)
                    .rate(itemCalc.rate())
                    .baseRate(itemCalc.baseRate())
                    .amount(itemCalc.amount())
                    .baseAmount(itemCalc.baseAmount())
                    .netRate(itemCalc.netRate())
                    .netAmount(itemCalc.netAmount())
                    .baseNetAmount(itemCalc.baseNetAmount())
                    .valuationRate(item.getValuationRate())
                    .grossProfit(itemCalc.grossProfit())
                    .deliveredQty(BigDecimal.ZERO)
                    .billedAmt(BigDecimal.ZERO)
                    .pickedQty(BigDecimal.ZERO)
                    .deliveredBySupplier(Boolean.TRUE.equals(itemReq.getDeliveredBySupplier()) || Boolean.TRUE.equals(item.getDeliveredBySupplier()))
                    .supplier(itemReq.getSupplier() != null && !itemReq.getSupplier().isBlank() ? itemReq.getSupplier() : item.getDefaultSupplier())
                    .grantCommission(Boolean.TRUE.equals(itemReq.getGrantCommission()))
                    .build();

            order.getItems().add(orderItem);
            totalQty = totalQty.add(orderItem.getQty());
            netTotal = netTotal.add(itemCalc.netAmount());
        }

        // Inject free promotional items
        int currentIdx = order.getItems().size();
        for (SalesOrderItem freeItem : freeItemsToInject) {
            currentIdx++;
            freeItem.setIdx(currentIdx);
            order.getItems().add(freeItem);
            totalQty = totalQty.add(freeItem.getQty());
        }

        // Wire Coupon Codes: Apply promotional coupon discount if provided
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            CouponApplyResponse couponRes = pricingRuleEngine.validateAndApplyCoupon(
                    CouponApplyRequest.builder().couponCode(request.getCouponCode()).orderAmount(netTotal).build());
            if (couponRes.isValid() && couponRes.getCalculatedDiscountAmount() != null) {
                order.setDiscountAmount(order.getDiscountAmount().add(couponRes.getCalculatedDiscountAmount()));
            }
        }

        order.setTotalQty(totalQty);
        order.setNetTotal(netTotal);
        order.setBaseNetTotal(netTotal.multiply(order.getConversionRate()));

        // 2. Process Taxes
        List<SalesTaxAndCharge> taxesToSave = new ArrayList<>();
        if (request.getTaxes() != null) {
            for (int i = 0; i < request.getTaxes().size(); i++) {
                SalesOrderCreateRequest.OrderTaxRequest taxReq = request.getTaxes().get(i);
                taxesToSave.add(SalesTaxAndCharge.builder()
                        .voucherType("Sales Order")
                        .idx(i + 1)
                        .chargeType(taxReq.getChargeType() != null ? taxReq.getChargeType() : TaxChargeType.ON_NET_TOTAL)
                        .rowId(taxReq.getRowId())
                        .accountHead(taxReq.getAccountHead())
                        .description(taxReq.getDescription())
                        .rate(taxReq.getRate() != null ? taxReq.getRate() : BigDecimal.ZERO)
                        .build());
            }
        }

        TaxCalculationEngine.TaxCalculationResult taxResult = taxCalculationEngine.calculateTaxes(
                netTotal,
                order.getConversionRate(),
                taxesToSave
        );

        order.setTotalTaxesAndCharges(taxResult.totalTaxesAndCharges());
        order.setBaseTotalTaxesAndCharges(taxResult.totalTaxesAndCharges().multiply(order.getConversionRate()));

        // 3. Document Totals & Header Discounts
        PricingEngine.DocumentTotalsResult totalsResult = pricingEngine.calculateDocumentTotals(
                netTotal,
                taxResult.totalTaxesAndCharges(),
                order.getAdditionalDiscountPercentage(),
                order.getDiscountAmount(),
                order.getApplyDiscountOn(),
                order.getConversionRate()
        );

        order.setGrandTotal(totalsResult.grandTotal());
        order.setBaseGrandTotal(totalsResult.baseGrandTotal());

        // 4. Commission Calculation
        List<SalesTeamMember> salesTeamList = new ArrayList<>();
        if (request.getSalesTeam() != null) {
            for (SalesOrderCreateRequest.OrderSalesTeamRequest teamReq : request.getSalesTeam()) {
                salesTeamList.add(SalesTeamMember.builder()
                        .voucherType("Sales Order")
                        .salesPersonName(teamReq.getSalesPersonName())
                        .allocatedPercentage(teamReq.getAllocatedPercentage())
                        .commissionRate(teamReq.getCommissionRate())
                        .build());
            }
        }

        CommissionEngine.CommissionDistributionResult commResult = commissionEngine.calculateCommission(
                order.getItems(),
                order.getCommissionRate(),
                salesTeamList
        );

        order.setAmountEligibleForCommission(commResult.amountEligibleForCommission());
        order.setTotalCommission(commResult.totalCommission());

        SalesOrder saved = salesOrderRepository.save(order);

        // Save Taxes & Team Members
        for (SalesTaxAndCharge tax : taxResult.calculatedTaxes()) {
            tax.setVoucherId(saved.getId());
            taxRepository.save(tax);
        }

        for (SalesTeamMember member : commResult.calculatedTeam()) {
            member.setVoucherId(saved.getId());
            salesTeamRepository.save(member);
        }

        return mapToDto(saved);
    }

    @Transactional
    public SalesOrderDto submitSalesOrder(UUID id) {
        SalesOrder order = salesOrderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesOrder", id));

        if (order.getStatus() != SalesOrderStatus.DRAFT) {
            throw new BusinessValidationException(String.format("Sales Order '%s' is already submitted or in %s state", order.getOrderNumber(), order.getStatus()));
        }

        // 1. Credit Limit Validation
        Customer customer = order.getCustomer();
        creditLimitValidator.validateCustomerCredit(customer, order.getGrandTotal());

        // 2. State Transition
        order.setStatus(SalesOrderStatus.TO_DELIVER_AND_BILL);
        order.setDeliveryStatus(DeliveryStatus.NOT_DELIVERED);
        order.setBillingStatus(BillingStatus.NOT_BILLED);
        order.setSubmittedAt(OffsetDateTime.now());

        // 3. Stock Reservations (if reserveStock is enabled)
        if (Boolean.TRUE.equals(order.getReserveStock())) {
            for (SalesOrderItem item : order.getItems()) {
                if (Boolean.TRUE.equals(item.getItem().getIsStockItem()) && !Boolean.TRUE.equals(item.getDeliveredBySupplier())) {
                    StockReservation sre = StockReservation.builder()
                            .salesOrder(order)
                            .salesOrderItem(item)
                            .itemCode(item.getItemCode())
                            .warehouse(item.getWarehouse())
                            .reservedQty(item.getStockQty())
                            .status("Reserved")
                            .build();
                    order.getStockReservations().add(sre);
                    stockReservationRepository.save(sre);
                }
            }
        }

        // 4. Update Customer Outstanding Balance
        customer.setOutstandingBalance(customer.getOutstandingBalance().add(order.getGrandTotal()));
        customerRepository.save(customer);

        // 5. Update linked Quotation status to ORDERED if applicable
        if (order.getQuotationId() != null) {
            quotationRepository.findById(order.getQuotationId()).ifPresent(q -> {
                q.setStatus(QuotationStatus.ORDERED);
                quotationRepository.save(q);
            });
        }

        // 6. Update linked Blanket Order ordered quantities if applicable
        if (order.getBlanketOrderId() != null) {
            for (SalesOrderItem item : order.getItems()) {
                blanketOrderService.updateOrderedQuantity(order.getBlanketOrderId(), item.getItemCode(), item.getQty());
            }
        }

        // 7. Allocate Sales Partner Commission if applicable
        if (order.getSalesPartnerId() != null && order.getTotalCommission() != null && order.getTotalCommission().compareTo(BigDecimal.ZERO) > 0) {
            salesPartnerService.allocateCommission(order.getSalesPartnerId(), order.getNetTotal(), order.getTotalCommission());
        }

        SalesOrder saved = salesOrderRepository.save(order);
        return mapToDto(saved);
    }

    @Transactional
    public SalesOrderDto cancelSalesOrder(UUID id) {
        SalesOrder order = salesOrderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesOrder", id));

        if (order.getStatus() == SalesOrderStatus.CANCELLED) {
            throw new BusinessValidationException("Sales Order is already cancelled");
        }

        if (order.getStatus() == SalesOrderStatus.COMPLETED) {
            throw new BusinessValidationException("Cannot cancel a completed Sales Order");
        }

        // Release stock reservations
        for (StockReservation sre : order.getStockReservations()) {
            sre.setStatus("Cancelled");
            stockReservationRepository.save(sre);
        }

        // Revert customer outstanding balance if was submitted
        if (order.getStatus() != SalesOrderStatus.DRAFT) {
            Customer customer = order.getCustomer();
            customer.setOutstandingBalance(customer.getOutstandingBalance().subtract(order.getGrandTotal()));
            if (customer.getOutstandingBalance().compareTo(BigDecimal.ZERO) < 0) {
                customer.setOutstandingBalance(BigDecimal.ZERO);
            }
            customerRepository.save(customer);

            // Revert Blanket Order ordered quantities if was submitted
            if (order.getBlanketOrderId() != null) {
                for (SalesOrderItem item : order.getItems()) {
                    blanketOrderService.revertOrderedQuantity(order.getBlanketOrderId(), item.getItemCode(), item.getQty());
                }
            }

            // Revert Sales Partner Commission if was submitted
            if (order.getSalesPartnerId() != null && order.getTotalCommission() != null && order.getTotalCommission().compareTo(BigDecimal.ZERO) > 0) {
                salesPartnerService.revertCommission(order.getSalesPartnerId(), order.getNetTotal(), order.getTotalCommission());
            }
        }

        order.setStatus(SalesOrderStatus.CANCELLED);
        SalesOrder saved = salesOrderRepository.save(order);
        return mapToDto(saved);
    }

    @Transactional
    public SalesOrderDto createReleaseOrderFromBlanket(UUID blanketOrderId) {
        BlanketOrder bo = blanketOrderRepository.findByIdWithItems(blanketOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("BlanketOrder", blanketOrderId));

        if (bo.getStatus() == BlanketOrder.BlanketOrderStatus.CLOSED || bo.getStatus() == BlanketOrder.BlanketOrderStatus.EXPIRED) {
            throw new BusinessValidationException("Cannot release order against a " + bo.getStatus() + " Blanket Order");
        }

        List<SalesOrderCreateRequest.OrderItemRequest> items = new ArrayList<>();
        if (bo.getItems() != null) {
            for (BlanketOrderItem bi : bo.getItems()) {
                BigDecimal remaining = bi.getRemainingQty();
                if (remaining != null && remaining.compareTo(BigDecimal.ZERO) > 0) {
                    items.add(SalesOrderCreateRequest.OrderItemRequest.builder()
                            .itemId(bi.getItem() != null ? bi.getItem().getId() : null)
                            .itemCode(bi.getItemCode())
                            .description(bi.getItemName())
                            .qty(remaining)
                            .priceListRate(bi.getRate())
                            .rate(bi.getRate())
                            .build());
                }
            }
        }

        if (items.isEmpty()) {
            throw new BusinessValidationException("All items on Blanket Order " + bo.getBlanketOrderNumber() + " have already been fully ordered.");
        }

        SalesOrderCreateRequest createReq = SalesOrderCreateRequest.builder()
                .customerId(bo.getCustomer().getId())
                .blanketOrderId(bo.getId())
                .deliveryDate(bo.getToDate() != null && bo.getToDate().isAfter(LocalDate.now()) ? bo.getToDate() : LocalDate.now().plusDays(14))
                .poNo("REL-" + bo.getBlanketOrderNumber())
                .items(items)
                .build();

        SalesOrderDto orderDto = createSalesOrder(createReq);
        return submitSalesOrder(orderDto.getId());
    }

    @Transactional
    public SalesOrderDto updateFulfillmentProgress(UUID id, BigDecimal perDelivered, BigDecimal perBilled) {
        SalesOrder order = salesOrderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesOrder", id));

        if (perDelivered != null) order.setPerDelivered(perDelivered);
        if (perBilled != null) order.setPerBilled(perBilled);

        order.recalculateStatuses();
        SalesOrder saved = salesOrderRepository.save(order);
        return mapToDto(saved);
    }

    public SalesOrderDto mapToDto(SalesOrder s) {
        List<SalesTaxAndCharge> taxes = taxRepository.findByVoucherTypeAndVoucherIdOrderByIdxAsc("Sales Order", s.getId());
        List<SalesTeamMember> team = salesTeamRepository.findByVoucherTypeAndVoucherId("Sales Order", s.getId());

        BigDecimal grandTotal = s.getGrandTotal() != null ? s.getGrandTotal() : BigDecimal.ZERO;
        String inWords = NumberToWordsConverter.convert(grandTotal, s.getCurrency() != null ? s.getCurrency() : "INR");
        BigDecimal roundedTotal = grandTotal.setScale(0, java.math.RoundingMode.HALF_UP);
        BigDecimal baseGrandTotal = s.getBaseGrandTotal() != null ? s.getBaseGrandTotal() : grandTotal;
        BigDecimal baseRoundedTotal = baseGrandTotal.setScale(0, java.math.RoundingMode.HALF_UP);

        return SalesOrderDto.builder()
                .id(s.getId())
                .orderNumber(s.getOrderNumber())
                .transactionDate(s.getTransactionDate())
                .deliveryDate(s.getDeliveryDate())
                .poNo(s.getPoNo())
                .poDate(s.getPoDate())
                .customerId(s.getCustomer() != null ? s.getCustomer().getId() : null)
                .customerName(s.getCustomerName())
                .orderType(s.getOrderType())
                .status(s.getStatus())
                .deliveryStatus(s.getDeliveryStatus())
                .billingStatus(s.getBillingStatus())
                .quotationId(s.getQuotationId())
                .blanketOrderId(s.getBlanketOrderId())
                .blanketOrderNumber(s.getBlanketOrderNumber())
                .currency(s.getCurrency())
                .conversionRate(s.getConversionRate())
                .sellingPriceListId(s.getSellingPriceListId())
                .totalQty(s.getTotalQty())
                .totalNetWeight(s.getTotalNetWeight())
                .netTotal(s.getNetTotal())
                .baseNetTotal(s.getBaseNetTotal())
                .totalTaxesAndCharges(s.getTotalTaxesAndCharges())
                .baseTotalTaxesAndCharges(s.getBaseTotalTaxesAndCharges())
                .discountAmount(s.getDiscountAmount())
                .additionalDiscountPercentage(s.getAdditionalDiscountPercentage())
                .applyDiscountOn(s.getApplyDiscountOn())
                .grandTotal(grandTotal)
                .baseGrandTotal(baseGrandTotal)
                .roundedTotal(roundedTotal)
                .baseRoundedTotal(baseRoundedTotal)
                .inWords(inWords)
                .advancePaid(s.getAdvancePaid())
                .perDelivered(s.getPerDelivered())
                .perBilled(s.getPerBilled())
                .perPicked(s.getPerPicked())
                .reserveStock(s.getReserveStock())
                .skipDeliveryNote(s.getSkipDeliveryNote())
                .paymentTermsTemplate(s.getPaymentTermsTemplate())
                .termsAndConditions(s.getTermsAndConditions())
                .salesPartnerId(s.getSalesPartnerId())
                .salesPartnerName(s.getSalesPartnerName())
                .amountEligibleForCommission(s.getAmountEligibleForCommission())
                .commissionRate(s.getCommissionRate())
                .totalCommission(s.getTotalCommission())
                .createdAt(s.getCreatedAt())
                .submittedAt(s.getSubmittedAt())
                .items(s.getItems() != null ? s.getItems().stream().map(i -> SalesOrderDto.SalesOrderItemDto.builder()
                        .id(i.getId())
                        .idx(i.getIdx())
                        .itemId(i.getItem() != null ? i.getItem().getId() : null)
                        .itemCode(i.getItemCode())
                        .itemName(i.getItemName())
                        .description(i.getDescription())
                        .warehouse(i.getWarehouse())
                        .deliveryDate(i.getDeliveryDate())
                        .qty(i.getQty())
                        .uom(i.getUom())
                        .conversionFactor(i.getConversionFactor())
                        .stockQty(i.getStockQty())
                        .priceListRate(i.getPriceListRate())
                        .discountPercentage(i.getDiscountPercentage())
                        .discountAmount(i.getDiscountAmount())
                        .rate(i.getRate())
                        .amount(i.getAmount())
                        .netRate(i.getNetRate())
                        .netAmount(i.getNetAmount())
                        .valuationRate(i.getValuationRate())
                        .grossProfit(i.getGrossProfit())
                        .deliveredQty(i.getDeliveredQty())
                        .billedAmt(i.getBilledAmt())
                        .pickedQty(i.getPickedQty())
                        .deliveredBySupplier(i.getDeliveredBySupplier())
                        .supplier(i.getSupplier())
                        .grantCommission(i.getGrantCommission())
                        .build()).collect(Collectors.toList()) : List.of())
                .taxes(taxes.stream().map(t -> SalesTaxAndChargeDto.builder()
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
                        .build()).collect(Collectors.toList()))
                .salesTeam(team.stream().map(m -> SalesTeamMemberDto.MemberDto.builder()
                        .id(m.getId())
                        .salesPersonName(m.getSalesPersonName())
                        .allocatedPercentage(m.getAllocatedPercentage())
                        .allocatedAmount(m.getAllocatedAmount())
                        .commissionRate(m.getCommissionRate())
                        .incentives(m.getIncentives())
                        .build()).collect(Collectors.toList()))
                .paymentSchedules(s.getPaymentSchedules() != null ? s.getPaymentSchedules().stream().map(ps -> SalesTeamMemberDto.ScheduleDto.builder()
                        .id(ps.getId())
                        .paymentTerm(ps.getPaymentTerm())
                        .dueDate(ps.getDueDate())
                        .invoicePortion(ps.getInvoicePortion())
                        .paymentAmount(ps.getPaymentAmount())
                        .outstanding(ps.getOutstanding())
                        .paidAmount(ps.getPaidAmount())
                        .build()).collect(Collectors.toList()) : List.of())
                .stockReservations(s.getStockReservations() != null ? s.getStockReservations().stream().map(sr -> SalesTeamMemberDto.ReservationDto.builder()
                        .id(sr.getId())
                        .salesOrderItemId(sr.getSalesOrderItem() != null ? sr.getSalesOrderItem().getId() : null)
                        .itemCode(sr.getItemCode())
                        .warehouse(sr.getWarehouse())
                        .reservedQty(sr.getReservedQty())
                        .deliveredQty(sr.getDeliveredQty())
                        .status(sr.getStatus())
                        .createdAt(sr.getCreatedAt())
                        .build()).collect(Collectors.toList()) : List.of())
                .build();
    }
}
