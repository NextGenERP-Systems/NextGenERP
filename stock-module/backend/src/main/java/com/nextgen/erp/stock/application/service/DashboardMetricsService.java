package com.nextgen.erp.stock.application.service;

import com.nextgen.erp.stock.application.dto.StockSummaryMetricsDto;
import com.nextgen.erp.stock.domain.model.Bin;
import com.nextgen.erp.stock.domain.model.Item;
import com.nextgen.erp.stock.domain.model.Warehouse;
import com.nextgen.erp.stock.infrastructure.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardMetricsService {

    private final BinRepository binRepository;
    private final ItemRepository itemRepository;
    private final WarehouseRepository warehouseRepository;
    private final BatchRepository batchRepository;
    private final SerialNoRepository serialNoRepository;
    private final QualityInspectionRepository qualityInspectionRepository;

    @Transactional(readOnly = true)
    public StockSummaryMetricsDto getDashboardMetrics() {
        List<Bin> allBins = binRepository.findAll();
        List<Item> allItems = itemRepository.findAll();
        List<Warehouse> allWarehouses = warehouseRepository.findAll();

        BigDecimal totalInventoryValue = BigDecimal.ZERO;
        long lowStockCount = 0;

        Map<String, BigDecimal> itemTotalQtyMap = new HashMap<>();

        // Calculate total valuation and group quantities per item
        for (Bin bin : allBins) {
            if (bin.getStockValue() != null) {
                totalInventoryValue = totalInventoryValue.add(bin.getStockValue());
            }
            if (bin.getActualQty() != null) {
                itemTotalQtyMap.merge(bin.getItemId(), bin.getActualQty(), BigDecimal::add);
            }
        }

        // Check low stock against safety stock
        for (Item item : allItems) {
            BigDecimal actualTotal = itemTotalQtyMap.getOrDefault(item.getId(), BigDecimal.ZERO);
            BigDecimal safety = item.getSafetyStock() != null ? item.getSafetyStock() : BigDecimal.ZERO;
            if (safety.compareTo(BigDecimal.ZERO) > 0 && actualTotal.compareTo(safety) <= 0) {
                lowStockCount++;
            }
        }

        // Warehouse summaries
        Map<String, List<Bin>> whBinsMap = new HashMap<>();
        for (Bin b : allBins) {
            whBinsMap.computeIfAbsent(b.getWarehouseId(), k -> new ArrayList<>()).add(b);
        }

        List<StockSummaryMetricsDto.WarehouseStockSummary> whSummaries = new ArrayList<>();
        for (Warehouse wh : allWarehouses) {
            List<Bin> bList = whBinsMap.getOrDefault(wh.getId(), List.of());
            BigDecimal val = bList.stream()
                    .map(b -> b.getStockValue() != null ? b.getStockValue() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal qty = bList.stream()
                    .map(b -> b.getActualQty() != null ? b.getActualQty() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            whSummaries.add(StockSummaryMetricsDto.WarehouseStockSummary.builder()
                    .warehouseId(wh.getId())
                    .warehouseName(wh.getWarehouseName())
                    .totalValue(val)
                    .itemCount(bList.size())
                    .totalItemsQuantity(qty)
                    .build());
        }

        return StockSummaryMetricsDto.builder()
                .totalInventoryValue(totalInventoryValue)
                .totalItemsCount(allItems.size())
                .totalWarehousesCount(allWarehouses.size())
                .lowStockAlertsCount(lowStockCount)
                .totalBatchesCount(batchRepository.count())
                .totalActiveSerialsCount(serialNoRepository.count())
                .pendingInspectionsCount(qualityInspectionRepository.count())
                .warehouseSummaries(whSummaries)
                .build();
    }
}
