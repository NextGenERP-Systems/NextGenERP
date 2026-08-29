package com.nextgen.erp.projects.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_template_tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectTemplateTask {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_template_id", nullable = false)
    private ProjectTemplate projectTemplate;

    @Column(nullable = false)
    private String subject;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "task_weight")
    @Builder.Default
    private Integer taskWeight = 1;

    @Column(name = "start_day")
    @Builder.Default
    private Integer startDay = 0;

    @Column(name = "duration_days")
    @Builder.Default
    private Integer durationDays = 1;

    @Column(name = "parent_task_subject")
    private String parentTaskSubject;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
