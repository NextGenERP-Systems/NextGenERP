package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.DeliveryNoteStatus;
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
public class DeliveryNoteDto {
    private UUID id;
    private String deliveryNoteNumber;
    private UUID salesOrderId;
    private UUID customerId;
    private String customerName;
    private LocalDate postingDate;
    private DeliveryNoteStatus status;
    private Boolean isReturn;
    private UUID returnAgainstId;
    private String returnAgainstNumber;
    private String carrier;
    private String trackingNumber;
    private String shippingAddress;
    private BigDecimal totalQty;
    private BigDecimal totalAmount;
    private String inWords;
    private String notes;
    @Builder.Default
    private List<DeliveryNoteItemDto> items = new ArrayList<>();
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
