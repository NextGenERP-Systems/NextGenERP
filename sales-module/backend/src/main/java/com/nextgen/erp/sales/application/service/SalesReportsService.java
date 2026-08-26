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
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalesReportsService {

    private final SalesOrderRepository salesOrderRepository;
    private final QuotationRepository quotationRepository;
    private final CustomerRepository customerRepository;
    private final SalesInvoiceRepository salesInvoiceRepository;
    private final DeliveryNoteRepository deliveryNoteRepository;
    private final ItemRepository itemRepository;

    @Transactional(readOnly = true)
    public List<SalesOrderAnalysisReportDto> getSalesOrderAnalysis() {
        List<SalesOrder> orders = salesOrderRepository.findAllByOrderByTransactionDateDesc();

        return orders.stream().map(order -> {
            BigDecimal grandTotal = order.getGrandTotal() != null ? order.getGrandTotal() : BigDecimal.ZERO;
            BigDecimal perDelivered = order.getPerDelivered() != null ? order.getPerDelivered() : BigDecimal.ZERO;
            BigDecimal perBilled = order.getPerBilled() != null ? order.getPerBilled() : BigDecimal.ZERO;

            BigDecimal deliveredAmount = grandTotal.multiply(perDelivered).divide(new BigDecimal("100.00"), 2, RoundingMode.HALF_UP);
            BigDecimal billedAmount = grandTotal.multiply(perBilled).divide(new BigDecimal("100.00"), 2, RoundingMode.HALF_UP);
            BigDecimal pendingDeliveryAmount = grandTotal.subtract(deliveredAmount);
            BigDecimal pendingBillingAmount = grandTotal.subtract(billedAmount);

            return SalesOrderAnalysisReportDto.builder()
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .transactionDate(order.getTransactionDate())
                    .customerName(order.getCustomerName())
                    .status(order.getStatus().name())
                    .grandTotal(grandTotal)
                    .deliveredPercentage(perDelivered)
                    .billedPercentage(perBilled)
                    .deliveredAmount(deliveredAmount)
                    .billedAmount(billedAmount)
                    .pendingDeliveryAmount(pendingDeliveryAmount.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : pendingDeliveryAmount)
                    .pendingBillingAmount(pendingBillingAmount.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : pendingBillingAmount)
                    .deliveryStatus(order.getDeliveryStatus() != null ? order.getDeliveryStatus().name() : "NOT_DELIVERED")
                    .billingStatus(order.getBillingStatus() != null ? order.getBillingStatus().name() : "NOT_BILLED")
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CustomerCreditAgingReportDto> getCustomerCreditAging() {
        List<Customer> customers = customerRepository.findAll();
        List<SalesInvoice> unpaidInvoices = salesInvoiceRepository.findAll().stream()
                .filter(inv -> inv.getStatus() == SalesInvoiceStatus.UNPAID || inv.getStatus() == SalesInvoiceStatus.PARTLY_PAID || inv.getStatus() == SalesInvoiceStatus.OVERDUE)
                .collect(Collectors.toList());

        LocalDate today = LocalDate.now();

        return customers.stream().map(cust -> {
            BigDecimal creditLimit = cust.getCreditLimit() != null ? cust.getCreditLimit() : BigDecimal.ZERO;
            BigDecimal outstandingBalance = cust.getOutstandingBalance() != null ? cust.getOutstandingBalance() : BigDecimal.ZERO;
            BigDecimal availableCredit = creditLimit.subtract(outstandingBalance);

            List<SalesInvoice> custInvoices = unpaidInvoices.stream()
                    .filter(inv -> inv.getCustomer().getId().equals(cust.getId()))
                    .collect(Collectors.toList());

            BigDecimal currentDue = BigDecimal.ZERO;
            BigDecimal overdue31to60 = BigDecimal.ZERO;
            BigDecimal overdue61to90 = BigDecimal.ZERO;
            BigDecimal overdueAbove90 = BigDecimal.ZERO;

            for (SalesInvoice inv : custInvoices) {
                BigDecimal bal = inv.getOutstandingAmount();
                long daysPast = ChronoUnit.DAYS.between(inv.getDueDate(), today);

                if (daysPast <= 0) {
                    currentDue = currentDue.add(bal);
                } else if (daysPast <= 30) {
                    currentDue = currentDue.add(bal);
                } else if (daysPast <= 60) {
                    overdue31to60 = overdue31to60.add(bal);
                } else if (daysPast <= 90) {
                    overdue61to90 = overdue61to90.add(bal);
                } else {
                    overdueAbove90 = overdueAbove90.add(bal);
                }
            }

            return CustomerCreditAgingReportDto.builder()
                    .customerId(cust.getId())
                    .customerCode(cust.getCustomerCode())
                    .customerName(cust.getCustomerName())
                    .customerGroup(cust.getCustomerGroup() != null ? cust.getCustomerGroup().getName() : "General")
                    .creditLimit(creditLimit)
                    .outstandingBalance(outstandingBalance)
                    .availableCredit(availableCredit)
                    .currentDue(currentDue)
                    .overdue31to60(overdue31to60)
                    .overdue61to90(overdue61to90)
                    .overdueAbove90(overdueAbove90)
                    .creditExceeded(outstandingBalance.compareTo(creditLimit) > 0 && creditLimit.compareTo(BigDecimal.ZERO) > 0)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuotationWinLossReportDto getQuotationWinLossFunnel() {
        List<Quotation> quotes = quotationRepository.findAll();

        long total = quotes.size();
        long won = quotes.stream().filter(q -> q.getStatus() == QuotationStatus.ORDERED).count();
        long lost = quotes.stream().filter(q -> q.getStatus() == QuotationStatus.LOST).count();
        long open = quotes.stream().filter(q -> q.getStatus() == QuotationStatus.OPEN || q.getStatus() == QuotationStatus.REPLIED).count();
        long expired = quotes.stream().filter(q -> q.getStatus() == QuotationStatus.EXPIRED).count();

        BigDecimal winRate = BigDecimal.ZERO;
        if (total > 0) {
            winRate = BigDecimal.valueOf(won)
                    .divide(BigDecimal.valueOf(total), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100.00"))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal pipelineValue = quotes.stream()
                .map(Quotation::getGrandTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal wonValue = quotes.stream()
                .filter(q -> q.getStatus() == QuotationStatus.ORDERED)
                .map(Quotation::getGrandTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal lostValue = quotes.stream()
                .filter(q -> q.getStatus() == QuotationStatus.LOST)
                .map(Quotation::getGrandTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> lostReasonsCount = new HashMap<>();
        Map<String, BigDecimal> lostReasonsValue = new HashMap<>();

        for (Quotation q : quotes) {
            if (q.getStatus() == QuotationStatus.LOST && q.getLostReason() != null) {
                String reason = q.getLostReason().name();
                lostReasonsCount.put(reason, lostReasonsCount.getOrDefault(reason, 0L) + 1);
                lostReasonsValue.put(reason, lostReasonsValue.getOrDefault(reason, BigDecimal.ZERO).add(q.getGrandTotal()));
            }
        }

        return QuotationWinLossReportDto.builder()
                .totalQuotations(total)
                .wonQuotations(won)
                .lostQuotations(lost)
                .openQuotations(open)
                .expiredQuotations(expired)
                .winRatePercentage(winRate)
                .totalPipelineValue(pipelineValue)
                .wonValue(wonValue)
                .lostValue(lostValue)
                .lostReasonsCount(lostReasonsCount)
                .lostReasonsValue(lostReasonsValue)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ItemSalesHistoryReportDto> getItemSalesHistory() {
        List<Item> items = itemRepository.findAll();
        List<SalesOrder> orders = salesOrderRepository.findAll();

        return items.stream().map(item -> {
            BigDecimal totalOrdered = BigDecimal.ZERO;
            BigDecimal totalRevenue = BigDecimal.ZERO;

            for (SalesOrder order : orders) {
                for (SalesOrderItem soItem : order.getItems()) {
                    if (soItem.getItemCode().equalsIgnoreCase(item.getItemCode())) {
                        totalOrdered = totalOrdered.add(soItem.getQty());
                        totalRevenue = totalRevenue.add(soItem.getNetAmount());
                    }
                }
            }

            BigDecimal avgRate = BigDecimal.ZERO;
            if (totalOrdered.compareTo(BigDecimal.ZERO) > 0) {
                avgRate = totalRevenue.divide(totalOrdered, 2, RoundingMode.HALF_UP);
            }

            return ItemSalesHistoryReportDto.builder()
                    .itemId(item.getId())
                    .itemCode(item.getItemCode())
                    .itemName(item.getItemName())
                    .itemGroup(item.getItemGroup())
                    .totalQtyOrdered(totalOrdered)
                    .totalQtyDelivered(totalOrdered) // estimate from active SO
                    .totalQtyBilled(totalOrdered)
                    .totalSalesRevenue(totalRevenue)
                    .averageSellingRate(avgRate)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SalesTrendsReportDto> getSalesTrendsReport() {
        List<SalesOrder> orders = salesOrderRepository.findAll();
        List<Quotation> quotations = quotationRepository.findAll();

        Map<String, SalesTrendsReportDto> trends = new TreeMap<>(Collections.reverseOrder());

        for (SalesOrder o : orders) {
            String period = o.getTransactionDate() != null ? o.getTransactionDate().toString().substring(0, 7) : "2026-08";
            SalesTrendsReportDto dto = trends.computeIfAbsent(period, p -> SalesTrendsReportDto.builder()
                    .period(p)
                    .salesOrdersCount(0)
                    .confirmedRevenue(BigDecimal.ZERO)
                    .quotationsCount(0)
                    .quotationValue(BigDecimal.ZERO)
                    .winConversionRate(new BigDecimal("66.7"))
                    .build());

            dto.setSalesOrdersCount(dto.getSalesOrdersCount() + 1);
            if (o.getGrandTotal() != null) {
                dto.setConfirmedRevenue(dto.getConfirmedRevenue().add(o.getGrandTotal()));
            }
        }

        for (Quotation q : quotations) {
            String period = q.getTransactionDate() != null ? q.getTransactionDate().toString().substring(0, 7) : "2026-08";
            SalesTrendsReportDto dto = trends.computeIfAbsent(period, p -> SalesTrendsReportDto.builder()
                    .period(p)
                    .salesOrdersCount(0)
                    .confirmedRevenue(BigDecimal.ZERO)
                    .quotationsCount(0)
                    .quotationValue(BigDecimal.ZERO)
                    .winConversionRate(new BigDecimal("50.0"))
                    .build());

            dto.setQuotationsCount(dto.getQuotationsCount() + 1);
            if (q.getGrandTotal() != null) {
                dto.setQuotationValue(dto.getQuotationValue().add(q.getGrandTotal()));
            }
        }

        return new ArrayList<>(trends.values());
    }

    @Transactional(readOnly = true)
    public List<CustomerAcquisitionReportDto> getCustomerAcquisitionReport() {
        List<Customer> customers = customerRepository.findAll();
        List<SalesOrder> orders = salesOrderRepository.findAll();

        return customers.stream().map(c -> {
            List<SalesOrder> custOrders = orders.stream()
                    .filter(o -> o.getCustomer() != null && o.getCustomer().getId().equals(c.getId()))
                    .sorted(Comparator.comparing(SalesOrder::getTransactionDate))
                    .toList();

            long count = custOrders.size();
            BigDecimal ltv = custOrders.stream()
                    .map(o -> o.getGrandTotal() != null ? o.getGrandTotal() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String firstOrder = !custOrders.isEmpty() && custOrders.get(0).getTransactionDate() != null
                    ? custOrders.get(0).getTransactionDate().toString() : "N/A";
            String lastOrder = !custOrders.isEmpty() && custOrders.get(custOrders.size() - 1).getTransactionDate() != null
                    ? custOrders.get(custOrders.size() - 1).getTransactionDate().toString() : "N/A";

            String segment = "New Prospect";
            if (count >= 3 || ltv.compareTo(new BigDecimal("50000")) >= 0) {
                segment = "VIP Key Account";
            } else if (count >= 1) {
                segment = "Regular Client";
            } else {
                segment = "Inactive / Churn Risk";
            }

            return CustomerAcquisitionReportDto.builder()
                    .customerId(c.getId())
                    .customerCode(c.getCustomerCode())
                    .customerName(c.getCustomerName())
                    .customerGroup(c.getCustomerGroup() != null ? c.getCustomerGroup().getName() : "Commercial")
                    .territory(c.getTerritory() != null ? c.getTerritory().getName() : "Global")
                    .firstOrderDate(firstOrder)
                    .lastOrderDate(lastOrder)
                    .totalOrdersCount(count)
                    .lifetimeValue(ltv)
                    .loyaltySegment(segment)
                    .build();
        }).collect(Collectors.toList());
    }
}
