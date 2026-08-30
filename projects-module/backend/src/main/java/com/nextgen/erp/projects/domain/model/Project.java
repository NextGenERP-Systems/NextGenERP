package com.nextgen.erp.projects.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_type_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private ProjectType projectType;

    @com.fasterxml.jackson.annotation.JsonProperty("projectTypeId")
    @Transient
    public UUID getProjectTypeId() {
        return projectType != null ? projectType.getId() : null;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_template_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private ProjectTemplate projectTemplate;

    @com.fasterxml.jackson.annotation.JsonProperty("projectTemplateId")
    @Transient
    public UUID getProjectTemplateId() {
        return projectTemplate != null ? projectTemplate.getId() : null;
    }

    @Column(name = "is_template")
    @Builder.Default
    private Boolean isTemplate = false;

    @Column(name = "customer_id")
    private UUID customerId;

    @Column(name = "sales_order_id")
    private UUID salesOrderId;

    @Column(name = "department")
    private String department;

    @Column(name = "company")
    private String company;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectPriority priority;

    @Column(name = "expected_start_date")
    private LocalDate expectedStartDate;

    @Column(name = "expected_end_date")
    private LocalDate expectedEndDate;

    @Column(name = "actual_start_date")
    private LocalDate actualStartDate;

    @Column(name = "actual_end_date")
    private LocalDate actualEndDate;

    @Column(name = "estimated_cost", precision = 12, scale = 2)
    private BigDecimal estimatedCost;

    @Column(name = "actual_cost", precision = 12, scale = 2)
    private BigDecimal actualCost;
    
    @Column(name = "total_billable_amount", precision = 12, scale = 2)
    private BigDecimal totalBillableAmount = BigDecimal.ZERO;
    
    @Column(name = "total_costing_amount", precision = 12, scale = 2)
    private BigDecimal totalCostingAmount = BigDecimal.ZERO;
    
    @Column(name = "gross_margin", precision = 12, scale = 2)
    private BigDecimal grossMargin = BigDecimal.ZERO;

    @Column(name = "percent_complete")
    private Integer percentComplete = 0;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "percent_complete_method", nullable = false)
    @Builder.Default
    private PercentCompleteMethod percentCompleteMethod = PercentCompleteMethod.MANUAL;

    @Column(name = "project_manager_id")
    private UUID projectManagerId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
