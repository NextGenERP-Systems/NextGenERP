package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.SalesInvoiceStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesInvoiceDto {
    private UUID id;
    private String invoiceNumber;
    private UUID salesOrderId;
    private UUID deliveryNoteId;
    private UUID customerId;
    private String customerName;
    private LocalDate postingDate;
    private LocalDate dueDate;
    private SalesInvoiceStatus status;
    private Boolean isReturn;
    private UUID returnAgainstId;
    private String returnAgainstNumber;
    private BigDecimal allocatedAdvanceAmount;
    private String currency;
    private BigDecimal conversionRate;
    private BigDecimal netTotal;
    private BigDecimal totalTax;
    private BigDecimal grandTotal;
    private BigDecimal roundedTotal;
    private String inWords;
    private BigDecimal paidAmount;
    private BigDecimal outstandingAmount;
    private UUID salesPartnerId;
    private String salesPartnerName;
    private BigDecimal commissionRate;
    private BigDecimal totalCommission;
    private String paymentTerms;
    private String notes;
    @Builder.Default
    private List<SalesInvoiceItemDto> items = new ArrayList<>();
    @Builder.Default
    private List<SalesTaxAndChargeDto> taxes = new ArrayList<>();
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
