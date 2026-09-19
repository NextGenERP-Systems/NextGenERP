package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "mrp_item_alternative")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemAlternative {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "item_code", nullable = false, length = 100)
    private String itemCode;

    @Column(name = "alternative_item_code", nullable = false, length = 100)
    private String alternativeItemCode;

    @Column(name = "two_way", nullable = false)
    @Builder.Default
    private Boolean twoWay = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;
}
