package com.nextgen.erp.stock.application.dto;

import com.nextgen.erp.stock.domain.model.WarehouseType;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseDto {
    private String id;

    @NotBlank(message = "Warehouse name is required")
    private String warehouseName;

    private String parentWarehouseId;
    private Boolean isGroup;
    private WarehouseType warehouseType;
    private String companyName;
    private String address;
    private String city;
    private String state;
    private String country;
    private Boolean isDisabled;
}
