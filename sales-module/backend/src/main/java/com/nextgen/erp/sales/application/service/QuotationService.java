package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.*;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final CustomerRepository customerRepository;
    private final ItemRepository itemRepository;
    private final SalesTaxAndChargeRepository taxRepository;
    private final PricingEngine pricingEngine;
    private final TaxCalculationEngine taxCalculationEngine;
    private final PricingRuleEngine pricingRuleEngine;

    @Transactional(readOnly = true)
    public List<QuotationDto> getAllQuotations() {
        return quotationRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuotationDto getQuotationById(UUID id) {
        Quotation quotation = quotationRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation", id));
        return mapToDto(quotation);
    }

    @Transactional
    public QuotationDto createQuotation(QuotationCreateRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));

        String qtnNumber = request.getQuotationNumber();
        if (qtnNumber == null || qtnNumber.isBlank()) {
            qtnNumber = "SAL-QTN-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }

        Quotation quotation = Quotation.builder()
                .quotationNumber(qtnNumber)
                .transactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDate.now())
                .validTill(request.getValidTill() != null ? request.getValidTill() : LocalDate.now().plusDays(30))
                .customer(customer)
                .customerName(customer.getCustomerName())
                .orderType(request.getOrderType() != null ? request.getOrderType() : OrderType.SALES)
                .status(QuotationStatus.OPEN)
                .currency(request.getCurrency())
                .conversionRate(request.getConversionRate())
                .sellingPriceListId(request.getSellingPriceListId())
                .additionalDiscountPercentage(request.getAdditionalDiscountPercentage())
                .discountAmount(request.getDiscountAmount())
                .applyDiscountOn(request.getApplyDiscountOn())
                .paymentTermsTemplate(request.getPaymentTermsTemplate())
                .termsAndConditions(request.getTermsAndConditions())
                .opportunityId(request.getOpportunityId())
                .notes(request.getNotes())
                .items(new ArrayList<>())
                .build();

        // 1. Process Quotation Items
        BigDecimal totalQty = BigDecimal.ZERO;
        BigDecimal netTotal = BigDecimal.ZERO;

        for (int i = 0; i < request.getItems().size(); i++) {
            QuotationCreateRequest.ItemRequest itemReq = request.getItems().get(i);
            Item item = itemRepository.findById(itemReq.getItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Item", itemReq.getItemId()));

            BigDecimal priceListRate = itemReq.getPriceListRate() != null ? itemReq.getPriceListRate() : item.getStandardRate();
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

            PricingEngine.ItemPricingResult itemCalc = pricingEngine.calculateItemPricing(
                    itemReq.getQty(),
                    BigDecimal.ONE,
                    priceListRate,
                    discountPct,
                    discountAmt,
                    quotation.getConversionRate(),
                    item.getValuationRate()
            );

            QuotationItem qItem = QuotationItem.builder()
                    .quotation(quotation)
                    .idx(i + 1)
                    .item(item)
                    .itemCode(item.getItemCode())
                    .itemName(item.getItemName())
                    .description(itemReq.getDescription() != null ? itemReq.getDescription() : item.getItemName())
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
                    .build();

            quotation.getItems().add(qItem);
            totalQty = totalQty.add(qItem.getQty());
            netTotal = netTotal.add(itemCalc.netAmount());
        }

        // Wire Coupon Codes: Apply promotional coupon discount if provided
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            CouponApplyResponse couponRes = pricingRuleEngine.validateAndApplyCoupon(
                    CouponApplyRequest.builder().couponCode(request.getCouponCode()).orderAmount(netTotal).build());
            if (couponRes.isValid() && couponRes.getCalculatedDiscountAmount() != null) {
                quotation.setDiscountAmount(quotation.getDiscountAmount().add(couponRes.getCalculatedDiscountAmount()));
            }
        }

        quotation.setTotalQty(totalQty);
        quotation.setNetTotal(netTotal);
        quotation.setBaseNetTotal(netTotal.multiply(quotation.getConversionRate()));

        // 2. Process Taxes
        List<SalesTaxAndCharge> taxesToSave = new ArrayList<>();
        if (request.getTaxes() != null) {
            for (int i = 0; i < request.getTaxes().size(); i++) {
                QuotationCreateRequest.TaxRequest taxReq = request.getTaxes().get(i);
                taxesToSave.add(SalesTaxAndCharge.builder()
                        .voucherType("Quotation")
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
                quotation.getConversionRate(),
                taxesToSave
        );

        quotation.setTotalTaxesAndCharges(taxResult.totalTaxesAndCharges());
        quotation.setBaseTotalTaxesAndCharges(taxResult.totalTaxesAndCharges().multiply(quotation.getConversionRate()));

        // 3. Final Grand Total & Header Discounts
        PricingEngine.DocumentTotalsResult totalsResult = pricingEngine.calculateDocumentTotals(
                netTotal,
                taxResult.totalTaxesAndCharges(),
                quotation.getAdditionalDiscountPercentage(),
                quotation.getDiscountAmount(),
                quotation.getApplyDiscountOn(),
                quotation.getConversionRate()
        );

        quotation.setGrandTotal(totalsResult.grandTotal());
        quotation.setBaseGrandTotal(totalsResult.baseGrandTotal());

        Quotation saved = quotationRepository.save(quotation);

        // Save tax rows with voucher ID
        for (SalesTaxAndCharge tax : taxResult.calculatedTaxes()) {
            tax.setVoucherId(saved.getId());
            taxRepository.save(tax);
        }

        return mapToDto(saved);
    }

    @Transactional
    public QuotationDto updateQuotationStatus(UUID id, QuotationStatus newStatus) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation", id));

        if (quotation.getStatus() == QuotationStatus.CANCELLED) {
            throw new BusinessValidationException("Cannot change status of a cancelled quotation");
        }

        quotation.setStatus(newStatus);
        Quotation saved = quotationRepository.save(quotation);
        return mapToDto(saved);
    }

    public QuotationDto mapToDto(Quotation q) {
        List<SalesTaxAndCharge> taxes = taxRepository.findByVoucherTypeAndVoucherIdOrderByIdxAsc("Quotation", q.getId());

        return QuotationDto.builder()
                .id(q.getId())
                .quotationNumber(q.getQuotationNumber())
                .transactionDate(q.getTransactionDate())
                .validTill(q.getValidTill())
                .customerId(q.getCustomer() != null ? q.getCustomer().getId() : null)
                .customerName(q.getCustomerName())
                .orderType(q.getOrderType())
                .status(q.getStatus())
                .currency(q.getCurrency())
                .conversionRate(q.getConversionRate())
                .sellingPriceListId(q.getSellingPriceListId())
                .totalQty(q.getTotalQty())
                .netTotal(q.getNetTotal())
                .baseNetTotal(q.getBaseNetTotal())
                .totalTaxesAndCharges(q.getTotalTaxesAndCharges())
                .baseTotalTaxesAndCharges(q.getBaseTotalTaxesAndCharges())
                .discountAmount(q.getDiscountAmount())
                .additionalDiscountPercentage(q.getAdditionalDiscountPercentage())
                .applyDiscountOn(q.getApplyDiscountOn())
                .grandTotal(q.getGrandTotal())
                .baseGrandTotal(q.getBaseGrandTotal())
                .paymentTermsTemplate(q.getPaymentTermsTemplate())
                .termsAndConditions(q.getTermsAndConditions())
                .notes(q.getNotes())
                .createdAt(q.getCreatedAt())
                .items(q.getItems() != null ? q.getItems().stream().map(i -> QuotationDto.QuotationItemDto.builder()
                        .id(i.getId())
                        .idx(i.getIdx())
                        .itemId(i.getItem() != null ? i.getItem().getId() : null)
                        .itemCode(i.getItemCode())
                        .itemName(i.getItemName())
                        .description(i.getDescription())
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
                        .orderedQty(i.getOrderedQty())
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
                .build();
    }
}
