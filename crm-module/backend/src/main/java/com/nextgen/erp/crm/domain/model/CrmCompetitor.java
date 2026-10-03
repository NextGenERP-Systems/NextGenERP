package com.nextgen.erp.crm.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name="crm_competitors") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmCompetitor {
    @Id @GeneratedValue(strategy=GenerationType.AUTO) private UUID id;
    @Column(nullable=false, unique=true, length=200) private String name;
    @Column(length=255) private String website;
    @Column(columnDefinition="TEXT") private String description;
    @Column(name="created_at", nullable=false, updatable=false) private OffsetDateTime createdAt;
    @Column(name="updated_at", nullable=false) private OffsetDateTime updatedAt;
    @PrePersist void onCreate(){var now=OffsetDateTime.now();createdAt=now;updatedAt=now;}
    @PreUpdate void onUpdate(){updatedAt=OffsetDateTime.now();}
}
