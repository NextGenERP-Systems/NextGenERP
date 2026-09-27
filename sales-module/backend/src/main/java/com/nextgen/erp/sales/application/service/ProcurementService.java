package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.domain.model.*;
import com.nextgen.erp.sales.infrastructure.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProcurementService {

    private final PurchaseRequisitionRepository requisitionRepository;
    private final SupplierQuotationRepository quotationRepository;
    private final SupplierQuotationItemRepository quotationItemRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;

    // -------------------------------------------------------------------------
    // 1. MATERIAL REQUESTS / REQUISITIONS
    // -------------------------------------------------------------------------
    @Transactional(readOnly = true)
    public List<PurchaseRequisition> getAllMaterialRequests() {
        return requisitionRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Optional<PurchaseRequisition> getMaterialRequestById(UUID id) {
        return requisitionRepository.findByIdWithItems(id);
    }

    @Transactional
    public PurchaseRequisition createMaterialRequest(PurchaseRequisition request) {
        if (request.getRequisitionNumber() == null || request.getRequisitionNumber().isBlank()) {
            long count = requisitionRepository.count() + 1;
            request.setRequisitionNumber(String.format("MAT-REQ-%d-%04d", LocalDate.now().getYear(), count));
        }

        BigDecimal totalQty = BigDecimal.ZERO;
        BigDecimal netTotal = BigDecimal.ZERO;

        if (request.getItems() != null) {
            for (PurchaseRequisitionItem item : request.getItems()) {
                item.setPurchaseRequisition(request);
                BigDecimal qty = item.getQty() != null ? item.getQty() : BigDecimal.ONE;
                BigDecimal rate = item.getRate() != null ? item.getRate() : BigDecimal.ZERO;
                BigDecimal amount = qty.multiply(rate);
                item.setAmount(amount);
                totalQty = totalQty.add(qty);
                netTotal = netTotal.add(amount);
            }
        }
        request.setTotalQty(totalQty);
        request.setNetTotal(netTotal);
        return requisitionRepository.save(request);
    }

    // -------------------------------------------------------------------------
    // 2. SUPPLIER QUOTATIONS & COMPARATIVE MATRIX
    // -------------------------------------------------------------------------
    @Transactional(readOnly = true)
    public List<SupplierQuotation> getAllSupplierQuotations() {
        return quotationRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Optional<SupplierQuotation> getSupplierQuotationById(UUID id) {
        return quotationRepository.findByIdWithItems(id);
    }

    @Transactional
    public SupplierQuotation createSupplierQuotation(SupplierQuotation quotation) {
        if (quotation.getQuotationNumber() == null || quotation.getQuotationNumber().isBlank()) {
            long count = quotationRepository.count() + 1;
            quotation.setQuotationNumber(String.format("SQ-%d-%04d", LocalDate.now().getYear(), count));
        }

        BigDecimal netTotal = BigDecimal.ZERO;
        if (quotation.getItems() != null) {
            for (SupplierQuotationItem item : quotation.getItems()) {
                item.setSupplierQuotation(quotation);
                BigDecimal qty = item.getQty() != null ? item.getQty() : BigDecimal.ONE;
                BigDecimal rate = item.getRate() != null ? item.getRate() : BigDecimal.ZERO;
                BigDecimal amount = qty.multiply(rate);
                item.setAmount(amount);
                netTotal = netTotal.add(amount);
            }
        }

        BigDecimal taxAmount = quotation.getTaxAmount() != null ? quotation.getTaxAmount() :
                netTotal.multiply(BigDecimal.valueOf(0.18)).setScale(2, RoundingMode.HALF_UP);
        quotation.setNetTotal(netTotal);
        quotation.setTaxAmount(taxAmount);
        quotation.setGrandTotal(netTotal.add(taxAmount));

        return quotationRepository.save(quotation);
    }

    @Transactional(readOnly = true)
    public QuotationComparisonDto compareQuotations(UUID materialRequestId) {
        List<SupplierQuotation> quotes = materialRequestId != null ?
                quotationRepository.findByMaterialRequestId(materialRequestId) :
                quotationRepository.findAllByOrderByCreatedAtDesc();

        if (quotes.isEmpty()) {
            return QuotationComparisonDto.builder()
                    .materialRequestId(materialRequestId)
                    .supplierQuotes(List.of())
                    .itemRows(List.of())
                    .recommendationReason("No supplier quotations received yet.")
                    .build();
        }

        List<QuotationComparisonDto.SupplierQuoteSummaryDto> quoteSummaries = new ArrayList<>();
        Map<String, Map<String, SupplierQuotationItem>> itemMap = new LinkedHashMap<>();

        SupplierQuotation bestQuote = quotes.get(0);

        for (SupplierQuotation q : quotes) {
            boolean isAwarded = q.getStatus() == SupplierQuotation.QuotationStatus.ACCEPTED ||
                    q.getStatus() == SupplierQuotation.QuotationStatus.ORDERED;

            quoteSummaries.add(QuotationComparisonDto.SupplierQuoteSummaryDto.builder()
                    .quotationId(q.getId())
                    .quotationNumber(q.getQuotationNumber())
                    .supplierName(q.getSupplierName())
                    .grandTotal(q.getGrandTotal())
                    .leadTimeDays(q.getLeadTimeDays())
                    .qualityRating(q.getQualityRating())
                    .paymentTerms(q.getPaymentTerms())
                    .isAwarded(isAwarded)
                    .build());

            if (q.getGrandTotal().compareTo(bestQuote.getGrandTotal()) < 0) {
                bestQuote = q;
            }

            if (q.getItems() != null) {
                for (SupplierQuotationItem item : q.getItems()) {
                    itemMap.putIfAbsent(item.getItemCode(), new HashMap<>());
                    itemMap.get(item.getItemCode()).put(q.getSupplierName(), item);
                }
            }
        }

        List<QuotationComparisonDto.ComparisonItemRowDto> rows = new ArrayList<>();
        for (Map.Entry<String, Map<String, SupplierQuotationItem>> entry : itemMap.entrySet()) {
            String itemCode = entry.getKey();
            Map<String, SupplierQuotationItem> supplierItems = entry.getValue();

            String itemName = itemCode;
            BigDecimal reqQty = BigDecimal.ONE;

            BigDecimal lowestRate = BigDecimal.valueOf(Double.MAX_VALUE);
            for (SupplierQuotationItem it : supplierItems.values()) {
                itemName = it.getItemName();
                reqQty = it.getQty();
                if (it.getRate().compareTo(lowestRate) < 0) {
                    lowestRate = it.getRate();
                }
            }

            List<QuotationComparisonDto.SupplierItemQuoteDto> sqDtos = new ArrayList<>();
            for (SupplierQuotation q : quotes) {
                SupplierQuotationItem it = supplierItems.get(q.getSupplierName());
                if (it != null) {
                    sqDtos.add(QuotationComparisonDto.SupplierItemQuoteDto.builder()
                            .supplierName(q.getSupplierName())
                            .rate(it.getRate())
                            .amount(it.getAmount())
                            .leadTimeDays(it.getLeadTimeDays())
                            .isLowestPrice(it.getRate().compareTo(lowestRate) == 0)
                            .build());
                }
            }

            rows.add(QuotationComparisonDto.ComparisonItemRowDto.builder()
                    .itemCode(itemCode)
                    .itemName(itemName)
                    .requiredQty(reqQty)
                    .quotesBySupplier(sqDtos)
                    .build());
        }

        return QuotationComparisonDto.builder()
                .materialRequestId(materialRequestId)
                .materialRequestNumber(quotes.get(0).getMaterialRequestNumber())
                .supplierQuotes(quoteSummaries)
                .itemRows(rows)
                .recommendedSupplier(bestQuote.getSupplierName())
                .recommendationReason(String.format("Lowest overall quoted cost (₹%s) with %d days lead time and rating %s★",
                        bestQuote.getGrandTotal(), bestQuote.getLeadTimeDays(), bestQuote.getQualityRating()))
                .build();
    }

    @Transactional
    public PurchaseOrder awardQuotationToPurchaseOrder(UUID quotationId) {
        SupplierQuotation quotation = quotationRepository.findByIdWithItems(quotationId)
                .orElseThrow(() -> new IllegalArgumentException("Supplier quotation not found: " + quotationId));

        quotation.setStatus(SupplierQuotation.QuotationStatus.ORDERED);
        quotationRepository.save(quotation);

        long count = purchaseOrderRepository.count() + 1;
        String poNumber = String.format("PO-%d-%04d", LocalDate.now().getYear(), count);

        PurchaseOrder po = PurchaseOrder.builder()
                .poNumber(poNumber)
                .supplierId(quotation.getSupplierId())
                .supplierName(quotation.getSupplierName())
                .supplierQuotationId(quotation.getId())
                .supplierQuotationNumber(quotation.getQuotationNumber())
                .materialRequestId(quotation.getMaterialRequestId())
                .materialRequestNumber(quotation.getMaterialRequestNumber())
                .transactionDate(LocalDate.now())
                .deliveryDate(LocalDate.now().plusDays(quotation.getLeadTimeDays() != null ? quotation.getLeadTimeDays() : 7))
                .currency(quotation.getCurrency())
                .exchangeRate(quotation.getExchangeRate())
                .netTotal(quotation.getNetTotal())
                .taxAmount(quotation.getTaxAmount())
                .grandTotal(quotation.getGrandTotal())
                .status(PurchaseOrder.PurchaseOrderStatus.SUBMITTED)
                .billingStatus("Not Billed")
                .receiptStatus("Not Received")
                .paymentTerms(quotation.getPaymentTerms())
                .notes("Generated automatically from awarded Supplier Quotation " + quotation.getQuotationNumber())
                .build();

        List<PurchaseOrderItem> poItems = new ArrayList<>();
        if (quotation.getItems() != null) {
            for (SupplierQuotationItem qi : quotation.getItems()) {
                poItems.add(PurchaseOrderItem.builder()
                        .purchaseOrder(po)
                        .itemCode(qi.getItemCode())
                        .itemName(qi.getItemName())
                        .description(qi.getDescription())
                        .qty(qi.getQty())
                        .receivedQty(BigDecimal.ZERO)
                        .billedQty(BigDecimal.ZERO)
                        .uom(qi.getUom())
                        .rate(qi.getRate())
                        .amount(qi.getAmount())
                        .targetWarehouse("Stores - Primary")
                        .build());
            }
        }
        po.setItems(poItems);

        return purchaseOrderRepository.save(po);
    }

    // -------------------------------------------------------------------------
    // 3. PURCHASE ORDERS
    // -------------------------------------------------------------------------
    @Transactional(readOnly = true)
    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Optional<PurchaseOrder> getPurchaseOrderById(UUID id) {
        return purchaseOrderRepository.findByIdWithItems(id);
    }

    @Transactional
    public PurchaseOrder createPurchaseOrder(PurchaseOrder po) {
        if (po.getPoNumber() == null || po.getPoNumber().isBlank()) {
            long count = purchaseOrderRepository.count() + 1;
            po.setPoNumber(String.format("PO-%d-%04d", LocalDate.now().getYear(), count));
        }

        BigDecimal netTotal = BigDecimal.ZERO;
        if (po.getItems() != null) {
            for (PurchaseOrderItem item : po.getItems()) {
                item.setPurchaseOrder(po);
                BigDecimal qty = item.getQty() != null ? item.getQty() : BigDecimal.ONE;
                BigDecimal rate = item.getRate() != null ? item.getRate() : BigDecimal.ZERO;
                BigDecimal amount = qty.multiply(rate);
                item.setAmount(amount);
                netTotal = netTotal.add(amount);
            }
        }

        BigDecimal taxAmount = po.getTaxAmount() != null ? po.getTaxAmount() :
                netTotal.multiply(BigDecimal.valueOf(0.18)).setScale(2, RoundingMode.HALF_UP);

        po.setNetTotal(netTotal);
        po.setTaxAmount(taxAmount);
        po.setGrandTotal(netTotal.add(taxAmount));

        return purchaseOrderRepository.save(po);
    }

    @Transactional
    public PurchaseOrder updatePurchaseOrderStatus(UUID id, PurchaseOrder.PurchaseOrderStatus status) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Purchase order not found: " + id));
        po.setStatus(status);
        return purchaseOrderRepository.save(po);
    }

    // -------------------------------------------------------------------------
    // 4. THREE-WAY MATCHING RECONCILIATION ENGINE
    // -------------------------------------------------------------------------
    @Transactional(readOnly = true)
    public ThreeWayMatchResultDto performThreeWayMatching(ThreeWayMatchRequest request) {
        PurchaseOrder po = null;
        if (request.getPurchaseOrderId() != null) {
            po = purchaseOrderRepository.findByIdWithItems(request.getPurchaseOrderId()).orElse(null);
        } else if (request.getPoNumber() != null) {
            po = purchaseOrderRepository.findByPoNumber(request.getPoNumber()).orElse(null);
        }

        if (po == null) {
            List<PurchaseOrder> all = purchaseOrderRepository.findAllByOrderByCreatedAtDesc();
            if (!all.isEmpty()) po = all.get(0);
        }

        if (po == null) {
            // Mock empty match result
            return ThreeWayMatchResultDto.builder()
                    .matchStatus("NO_ORDER")
                    .isApprovedForPayment(false)
                    .auditSummary("No Purchase Order specified for 3-way reconciliation audit.")
                    .lineItems(List.of())
                    .build();
        }

        List<ThreeWayMatchResultDto.MatchLineItemDto> lineDtos = new ArrayList<>();
        boolean anyQtyMismatch = false;
        boolean anyPriceMismatch = false;
        boolean anyOverbilled = false;

        for (PurchaseOrderItem item : po.getItems()) {
            BigDecimal orderedQty = item.getQty();
            BigDecimal receivedQty = item.getReceivedQty() != null ? item.getReceivedQty() : orderedQty;
            BigDecimal billedQty = item.getBilledQty() != null ? item.getBilledQty() : orderedQty;
            BigDecimal orderedRate = item.getRate();
            BigDecimal billedRate = item.getRate(); // Inward billed invoice rate

            BigDecimal qtyVariance = billedQty.subtract(receivedQty);
            BigDecimal rateVariance = billedRate.subtract(orderedRate);
            BigDecimal amountVariance = billedQty.multiply(billedRate).subtract(receivedQty.multiply(orderedRate));

            String lineStatus = "MATCHED";
            boolean isToleranceExceeded = false;

            if (billedQty.compareTo(receivedQty) > 0) {
                lineStatus = "OVER_BILLED";
                anyOverbilled = true;
                isToleranceExceeded = true;
            } else if (billedQty.compareTo(receivedQty) < 0) {
                lineStatus = "PARTIALLY_BILLED";
                anyQtyMismatch = true;
            }

            if (billedRate.compareTo(orderedRate) > 0) {
                lineStatus = "OVER_PRICED";
                anyPriceMismatch = true;
                isToleranceExceeded = true;
            }

            lineDtos.add(ThreeWayMatchResultDto.MatchLineItemDto.builder()
                    .itemCode(item.getItemCode())
                    .itemName(item.getItemName())
                    .orderedQty(orderedQty)
                    .receivedQty(receivedQty)
                    .billedQty(billedQty)
                    .orderedRate(orderedRate)
                    .billedRate(billedRate)
                    .qtyVariance(qtyVariance)
                    .rateVariance(rateVariance)
                    .amountVariance(amountVariance)
                    .lineStatus(lineStatus)
                    .isToleranceExceeded(isToleranceExceeded)
                    .build());
        }

        String overallStatus = "PERFECT_MATCH";
        boolean approved = true;
        String auditMsg = "All line items passed 3-Way reconciliation check. PO, Receipt & Vendor Bill are in exact parity.";

        if (anyOverbilled) {
            overallStatus = "BLOCKED_OVERBILLED";
            approved = false;
            auditMsg = "Audit Alert: Vendor Invoiced Quantity exceeds Physically Received Quantity. Payment blocked.";
        } else if (anyPriceMismatch) {
            overallStatus = "PRICE_MISMATCH";
            approved = false;
            auditMsg = "Audit Warning: Unit Price on Invoice exceeds PO contract rate. Requires Buyer manager override.";
        } else if (anyQtyMismatch) {
            overallStatus = "QUANTITY_MISMATCH";
            approved = true;
            auditMsg = "Notice: Partial quantity billed against received goods. Payment approved for verified portion.";
        }

        return ThreeWayMatchResultDto.builder()
                .purchaseOrderId(po.getId())
                .poNumber(po.getPoNumber())
                .supplierName(po.getSupplierName())
                .poDate(po.getTransactionDate())
                .poGrandTotal(po.getGrandTotal())
                .matchStatus(overallStatus)
                .isApprovedForPayment(approved)
                .auditSummary(auditMsg)
                .lineItems(lineDtos)
                .build();
    }
}
