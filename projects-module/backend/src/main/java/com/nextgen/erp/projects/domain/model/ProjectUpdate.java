package com.nextgen.erp.projects.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_updates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "update_date", nullable = false)
    private LocalDate updateDate;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String progress;
    
    @Column(columnDefinition = "TEXT")
    private String challenges;
    
    @Column(columnDefinition = "TEXT")
    private String nextSteps;

    @Column(name = "submitted_by")
    private UUID submittedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
