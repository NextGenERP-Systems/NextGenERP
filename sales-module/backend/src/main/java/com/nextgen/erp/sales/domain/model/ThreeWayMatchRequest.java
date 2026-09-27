package com.nextgen.erp.sales.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThreeWayMatchRequest {
    private UUID purchaseOrderId;
    private String poNumber;
    private String purchaseReceiptNumber;
    private String purchaseInvoiceNumber;
}
