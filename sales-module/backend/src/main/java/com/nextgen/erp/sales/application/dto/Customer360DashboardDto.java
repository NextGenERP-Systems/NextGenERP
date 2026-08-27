package com.nextgen.erp.sales.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Customer360DashboardDto {
    private CustomerDto customer;
    
    // Summary Metrics
    private long totalQuotationsCount;
    private BigDecimal totalQuotationsValue;
    
    private long totalSalesOrdersCount;
    private BigDecimal totalSalesOrdersValue;
    
    private long totalDeliveryNotesCount;
    private BigDecimal totalDeliveredQty;
    
    private long totalInvoicesCount;
    private BigDecimal totalInvoicedValue;
    private BigDecimal totalPaidValue;
    private BigDecimal totalOutstandingValue;
    
    private long totalPaymentsCount;
    private BigDecimal totalCollectedAmount;

    // Direct transaction lists for live tab views
    private List<QuotationDto> recentQuotations;
    private List<SalesOrderDto> recentSalesOrders;
    private List<DeliveryNoteDto> recentDeliveryNotes;
    private List<SalesInvoiceDto> recentSalesInvoices;
    private List<PaymentEntryDto> recentPaymentEntries;
    private List<GlEntryDto> customerLedger;
}
