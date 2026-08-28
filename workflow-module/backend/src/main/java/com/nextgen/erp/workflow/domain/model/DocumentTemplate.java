package com.nextgen.erp.workflow.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "document_templates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "template_name", nullable = false, unique = true)
    private String name;

    @Column(name = "category", nullable = false)
    private String documentType;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "content_html", columnDefinition = "TEXT", nullable = false)
    private String htmlContent;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
