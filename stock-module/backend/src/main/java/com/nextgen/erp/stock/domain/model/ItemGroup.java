package com.nextgen.erp.stock.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "item_groups", schema = "stock")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemGroup {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @Column(name = "parent_id", length = 64)
    private String parentId;

    @Column(name = "is_group")
    @Builder.Default
    private Boolean isGroup = false;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private ZonedDateTime updatedAt = ZonedDateTime.now();
}
