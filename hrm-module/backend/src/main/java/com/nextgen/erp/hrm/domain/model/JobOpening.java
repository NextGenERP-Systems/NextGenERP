package com.nextgen.erp.hrm.domain.model;

import com.nextgen.erp.hrm.domain.model.Enums.JobStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_openings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobOpening {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "job_title", nullable = false, length = 150)
    private String jobTitle;

    @Column(name = "job_code", unique = true, nullable = false, length = 50)
    private String jobCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "designation_id", nullable = false)
    private Designation designation;

    @Column(name = "vacancies", nullable = false)
    @Builder.Default
    private Integer vacancies = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private JobStatus status = JobStatus.OPEN;

    @Column(name = "location", length = 100)
    @Builder.Default
    private String location = "HQ / Hybrid";

    @Column(name = "min_experience_years", precision = 3, scale = 1)
    @Builder.Default
    private BigDecimal minExperienceYears = BigDecimal.valueOf(2.0);

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "posted_date", nullable = false)
    @Builder.Default
    private LocalDate postedDate = LocalDate.now();

    @Column(name = "closing_date")
    private LocalDate closingDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
