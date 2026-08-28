package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "product_bundles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductBundle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "new_item_code", nullable = false, length = 100)
    private String newItemCode;

    @Column(name = "bundle_name", length = 200)
    private String bundleName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    @Builder.Default
    private Boolean disabled = false;

    @OneToMany(mappedBy = "productBundle", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductBundleItem> items = new ArrayList<>();

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
