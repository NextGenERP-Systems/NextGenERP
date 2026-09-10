package com.nextgen.erp.stock.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "warehouses", schema = "stock")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Warehouse {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "warehouse_name", nullable = false, unique = true, length = 150)
    private String warehouseName;

    @Column(name = "parent_warehouse_id", length = 64)
    private String parentWarehouseId;

    @Column(name = "is_group")
    @Builder.Default
    private Boolean isGroup = false;

    @Convert(converter = WarehouseType.WarehouseTypeConverter.class)
    @Column(name = "warehouse_type", length = 50)
    @Builder.Default
    private WarehouseType warehouseType = WarehouseType.STORES;

    @Column(name = "company_name", length = 150)
    @Builder.Default
    private String companyName = "NextGen Corp";

    @Column(name = "account_id", length = 64)
    private String accountId;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 100)
    @Builder.Default
    private String country = "USA";

    @Column(name = "is_disabled")
    @Builder.Default
    private Boolean isDisabled = false;

    @Column(name = "created_at")
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private ZonedDateTime updatedAt = ZonedDateTime.now();
}
