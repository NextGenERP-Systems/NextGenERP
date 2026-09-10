package com.nextgen.erp.stock.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextgen.erp.stock.application.dto.BinDto;
import com.nextgen.erp.stock.domain.engine.FifoQueueElement;
import com.nextgen.erp.stock.domain.model.Bin;
import com.nextgen.erp.stock.domain.model.Item;
import com.nextgen.erp.stock.domain.model.Warehouse;
import com.nextgen.erp.stock.infrastructure.repository.BinRepository;
import com.nextgen.erp.stock.infrastructure.repository.ItemRepository;
import com.nextgen.erp.stock.infrastructure.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BinService {

    private final BinRepository binRepository;
    private final ItemRepository itemRepository;
    private final WarehouseRepository warehouseRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Bin getOrCreateBin(String itemId, String warehouseId) {
        return binRepository.findByItemIdAndWarehouseId(itemId, warehouseId)
                .orElseGet(() -> {
                    Bin newBin = Bin.builder()
                            .id("bin-" + UUID.randomUUID().toString().substring(0, 8))
                            .itemId(itemId)
                            .warehouseId(warehouseId)
                            .actualQty(BigDecimal.ZERO)
                            .orderedQty(BigDecimal.ZERO)
                            .reservedQty(BigDecimal.ZERO)
                            .indentedQty(BigDecimal.ZERO)
                            .plannedQty(BigDecimal.ZERO)
                            .projectedQty(BigDecimal.ZERO)
                            .valuationRate(BigDecimal.ZERO)
                            .stockValue(BigDecimal.ZERO)
                            .stockQueue("[]")
                            .build();
                    return binRepository.save(newBin);
                });
    }

    public List<FifoQueueElement> parseStockQueue(String jsonQueue) {
        if (jsonQueue == null || jsonQueue.isBlank() || jsonQueue.equals("[]")) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(jsonQueue, new TypeReference<List<FifoQueueElement>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse stock queue JSON: {}", jsonQueue, e);
            return new ArrayList<>();
        }
    }

    public String serializeStockQueue(List<FifoQueueElement> queue) {
        try {
            return objectMapper.writeValueAsString(queue != null ? queue : new ArrayList<>());
        } catch (Exception e) {
            log.warn("Failed to serialize stock queue", e);
            return "[]";
        }
    }

    @Transactional(readOnly = true)
    public List<BinDto> getAllBins() {
        return binRepository.findAll().stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<BinDto> getBinsByWarehouse(String warehouseId) {
        return binRepository.findByWarehouseId(warehouseId).stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<BinDto> getBinsByItem(String itemId) {
        return binRepository.findByItemId(itemId).stream().map(this::mapToDto).toList();
    }

    public BinDto mapToDto(Bin bin) {
        Item item = itemRepository.findById(bin.getItemId()).orElse(null);
        Warehouse warehouse = warehouseRepository.findById(bin.getWarehouseId()).orElse(null);

        return BinDto.builder()
                .id(bin.getId())
                .itemId(bin.getItemId())
                .itemCode(item != null ? item.getItemCode() : bin.getItemId())
                .itemName(item != null ? item.getItemName() : "Unknown Item")
                .warehouseId(bin.getWarehouseId())
                .warehouseName(warehouse != null ? warehouse.getWarehouseName() : "Unknown Warehouse")
                .actualQty(bin.getActualQty())
                .orderedQty(bin.getOrderedQty())
                .reservedQty(bin.getReservedQty())
                .indentedQty(bin.getIndentedQty())
                .plannedQty(bin.getPlannedQty())
                .projectedQty(bin.getProjectedQty())
                .valuationRate(bin.getValuationRate())
                .stockValue(bin.getStockValue())
                .build();
    }
}
