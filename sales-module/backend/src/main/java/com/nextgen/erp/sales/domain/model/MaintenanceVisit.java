package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "maintenance_visits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "visit_number", nullable = false, unique = true, length = 50)
    private String visitNumber;

    @Column(name = "customer_id")
    private UUID customerId;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "maintenance_contract_id")
    private UUID maintenanceContractId;

    @Enumerated(EnumType.STRING)
    @Column(name = "maintenance_type", nullable = false, length = 50)
    @Builder.Default
    private MaintenanceType maintenanceType = MaintenanceType.PREVENTIVE_MAINTENANCE;

    @Column(name = "visit_date", nullable = false)
    @Builder.Default
    private LocalDate visitDate = LocalDate.now();

    @Column(name = "service_person", nullable = false, length = 150)
    private String servicePerson;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private VisitStatus status = VisitStatus.SCHEDULED;

    @Column(name = "customer_feedback", length = 50)
    private String customerFeedback;

    @Column(name = "completion_notes", columnDefinition = "TEXT")
    private String completionNotes;

    @OneToMany(mappedBy = "maintenanceVisit", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MaintenanceVisitItem> items = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public enum MaintenanceType {
        PREVENTIVE_MAINTENANCE,
        BREAKDOWN,
        WARRANTY_CHECK
    }

    public enum VisitStatus {
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }

    public void addItem(MaintenanceVisitItem item) {
        items.add(item);
        item.setMaintenanceVisit(this);
    }
}
