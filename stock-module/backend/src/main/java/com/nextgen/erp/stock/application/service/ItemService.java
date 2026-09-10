package com.nextgen.erp.stock.application.service;

import com.nextgen.erp.stock.application.dto.ItemDto;
import com.nextgen.erp.stock.domain.model.Item;
import com.nextgen.erp.stock.infrastructure.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;

    @Transactional(readOnly = true)
    public List<ItemDto> getAllItems() {
        return itemRepository.findAll().stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public ItemDto getItemById(String id) {
        return itemRepository.findById(id).map(this::mapToDto)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + id));
    }

    @Transactional
    public ItemDto createItem(ItemDto dto) {
        Item item = Item.builder()
                .id(dto.getId() != null ? dto.getId() : "item-" + UUID.randomUUID().toString().substring(0, 8))
                .itemCode(dto.getItemCode())
                .itemName(dto.getItemName())
                .itemGroupId(dto.getItemGroupId())
                .stockUom(dto.getStockUom() != null ? dto.getStockUom() : "uom-nos")
                .isStockItem(dto.getIsStockItem() != null ? dto.getIsStockItem() : true)
                .valuationMethod(dto.getValuationMethod())
                .standardRate(dto.getStandardRate())
                .openingStock(dto.getOpeningStock())
                .safetyStock(dto.getSafetyStock())
                .leadTimeDays(dto.getLeadTimeDays())
                .hasVariants(dto.getHasVariants())
                .variantOf(dto.getVariantOf())
                .hasBatchNo(dto.getHasBatchNo())
                .hasSerialNo(dto.getHasSerialNo())
                .inspectionRequiredBeforeReceipt(dto.getInspectionRequiredBeforeReceipt())
                .inspectionRequiredBeforeDelivery(dto.getInspectionRequiredBeforeDelivery())
                .defaultWarehouseId(dto.getDefaultWarehouseId())
                .description(dto.getDescription())
                .barcode(dto.getBarcode())
                .imageUrl(dto.getImageUrl())
                .enabled(dto.getEnabled() != null ? dto.getEnabled() : true)
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .build();

        Item saved = itemRepository.save(item);
        return mapToDto(saved);
    }

    private ItemDto mapToDto(Item item) {
        return ItemDto.builder()
                .id(item.getId())
                .itemCode(item.getItemCode())
                .itemName(item.getItemName())
                .itemGroupId(item.getItemGroupId())
                .stockUom(item.getStockUom())
                .isStockItem(item.getIsStockItem())
                .valuationMethod(item.getValuationMethod())
                .standardRate(item.getStandardRate())
                .openingStock(item.getOpeningStock())
                .safetyStock(item.getSafetyStock())
                .leadTimeDays(item.getLeadTimeDays())
                .hasVariants(item.getHasVariants())
                .variantOf(item.getVariantOf())
                .hasBatchNo(item.getHasBatchNo())
                .hasSerialNo(item.getHasSerialNo())
                .inspectionRequiredBeforeReceipt(item.getInspectionRequiredBeforeReceipt())
                .inspectionRequiredBeforeDelivery(item.getInspectionRequiredBeforeDelivery())
                .defaultWarehouseId(item.getDefaultWarehouseId())
                .description(item.getDescription())
                .barcode(item.getBarcode())
                .imageUrl(item.getImageUrl())
                .enabled(item.getEnabled())
                .build();
    }
}
