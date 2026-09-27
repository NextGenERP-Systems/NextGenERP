package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.MaintenanceVisit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceVisitDto {
    private UUID id;
    private String visitNumber;
    private UUID customerId;
    private String customerName;
    private UUID maintenanceContractId;
    private MaintenanceVisit.MaintenanceType maintenanceType;
    private LocalDate visitDate;
    private String servicePerson;
    private MaintenanceVisit.VisitStatus status;
    private String customerFeedback;
    private String completionNotes;
    @Builder.Default
    private List<VisitItemDto> items = new ArrayList<>();
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VisitItemDto {
        private UUID id;
        private String itemCode;
        private String itemName;
        private String serialNo;
        private String workDone;
        private String actionTaken;
        private String partsReplaced;
    }
}
