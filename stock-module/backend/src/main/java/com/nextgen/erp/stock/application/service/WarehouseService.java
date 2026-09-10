package com.nextgen.erp.stock.application.service;

import com.nextgen.erp.stock.application.dto.WarehouseDto;
import com.nextgen.erp.stock.domain.model.Warehouse;
import com.nextgen.erp.stock.infrastructure.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    @Transactional(readOnly = true)
    public List<WarehouseDto> getAllWarehouses() {
        return warehouseRepository.findAll().stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public WarehouseDto getWarehouseById(String id) {
        return warehouseRepository.findById(id).map(this::mapToDto)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found: " + id));
    }

    @Transactional
    public WarehouseDto createWarehouse(WarehouseDto dto) {
        Warehouse wh = Warehouse.builder()
                .id(dto.getId() != null ? dto.getId() : "wh-" + UUID.randomUUID().toString().substring(0, 8))
                .warehouseName(dto.getWarehouseName())
                .parentWarehouseId(dto.getParentWarehouseId())
                .isGroup(dto.getIsGroup() != null ? dto.getIsGroup() : false)
                .warehouseType(dto.getWarehouseType())
                .companyName(dto.getCompanyName() != null ? dto.getCompanyName() : "NextGen Corp")
                .address(dto.getAddress())
                .city(dto.getCity())
                .state(dto.getState())
                .country(dto.getCountry() != null ? dto.getCountry() : "USA")
                .isDisabled(dto.getIsDisabled() != null ? dto.getIsDisabled() : false)
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .build();

        Warehouse saved = warehouseRepository.save(wh);
        return mapToDto(saved);
    }

    private WarehouseDto mapToDto(Warehouse wh) {
        return WarehouseDto.builder()
                .id(wh.getId())
                .warehouseName(wh.getWarehouseName())
                .parentWarehouseId(wh.getParentWarehouseId())
                .isGroup(wh.getIsGroup())
                .warehouseType(wh.getWarehouseType())
                .companyName(wh.getCompanyName())
                .address(wh.getAddress())
                .city(wh.getCity())
                .state(wh.getState())
                .country(wh.getCountry())
                .isDisabled(wh.getIsDisabled())
                .build();
    }
}
