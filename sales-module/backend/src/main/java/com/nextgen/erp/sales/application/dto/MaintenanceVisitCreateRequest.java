package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.MaintenanceVisit;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceVisitCreateRequest {

    @NotNull(message = "Customer ID is required")
    private UUID customerId;

    private UUID maintenanceContractId;

    @NotNull(message = "Maintenance Type is required")
    private MaintenanceVisit.MaintenanceType maintenanceType;

    @NotNull(message = "Visit Date is required")
    private LocalDate visitDate;

    @NotBlank(message = "Service Person name is required")
    private String servicePerson;

    private String customerFeedback;
    private String completionNotes;

    @NotEmpty(message = "At least one equipment item is required for the visit")
    private List<VisitItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VisitItemRequest {
        @NotBlank(message = "Item Code is required")
        private String itemCode;
        @NotBlank(message = "Item Name is required")
        private String itemName;
        private String serialNo;
        private String workDone;
        private String actionTaken;
        private String partsReplaced;
    }
}
