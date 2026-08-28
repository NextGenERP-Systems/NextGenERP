package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "item_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "item_group_name", nullable = false, unique = true, length = 100)
    private String itemGroupName;

    @Column(name = "parent_item_group", length = 100)
    @Builder.Default
    private String parentItemGroup = "All Item Groups";

    @Column(name = "is_group")
    @Builder.Default
    private Boolean isGroup = false;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
