package com.nextgen.erp.stock.application.service;

import com.nextgen.erp.stock.application.dto.StockLedgerEntryDto;
import com.nextgen.erp.stock.domain.engine.FIFOValuationEngine;
import com.nextgen.erp.stock.domain.engine.FifoQueueElement;
import com.nextgen.erp.stock.domain.engine.MovingAverageValuationEngine;
import com.nextgen.erp.stock.domain.engine.ValuationResult;
import com.nextgen.erp.stock.domain.exception.InsufficientStockException;
import com.nextgen.erp.stock.domain.model.*;
import com.nextgen.erp.stock.infrastructure.repository.ItemRepository;
import com.nextgen.erp.stock.infrastructure.repository.StockLedgerEntryRepository;
import com.nextgen.erp.stock.infrastructure.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockLedgerService {

    private final StockLedgerEntryRepository sleRepository;
    private final BinService binService;
    private final ItemRepository itemRepository;
    private final WarehouseRepository warehouseRepository;
    private final FIFOValuationEngine fifoValuationEngine;
    private final MovingAverageValuationEngine movingAverageValuationEngine;

    @Transactional
    public StockLedgerEntry postEntry(
            String itemId,
            String warehouseId,
            LocalDate postingDate,
            LocalTime postingTime,
            String voucherType,
            String voucherNo,
            BigDecimal actualQtyChange,
            BigDecimal incomingRate,
            String batchId,
            String serialNos,
            String remarks
    ) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));

        Bin bin = binService.getOrCreateBin(itemId, warehouseId);

        BigDecimal currentQty = bin.getActualQty() != null ? bin.getActualQty() : BigDecimal.ZERO;
        BigDecimal newQty = currentQty.add(actualQtyChange);

        // Validation against negative stock
        if (newQty.compareTo(BigDecimal.ZERO) < 0) {
            throw new InsufficientStockException(
                    String.format("Insufficient stock for item %s in warehouse %s. Current Qty: %s, Requested: %s",
                            item.getItemCode(), warehouseId, currentQty, actualQtyChange.abs())
            );
        }

        ValuationResult valuationResult;
        String serializedQueue = bin.getStockQueue();

        if (item.getValuationMethod() == ValuationMethod.MOVING_AVERAGE) {
            valuationResult = movingAverageValuationEngine.calculate(
                    currentQty,
                    bin.getValuationRate(),
                    actualQtyChange,
                    incomingRate
            );
        } else {
            // Default: FIFO
            List<FifoQueueElement> currentQueue = binService.parseStockQueue(bin.getStockQueue());
            valuationResult = fifoValuationEngine.calculate(currentQueue, actualQtyChange, incomingRate);
            serializedQueue = binService.serializeStockQueue(valuationResult.getUpdatedQueue());
        }

        // Update Bin state
        bin.setActualQty(newQty);
        bin.setValuationRate(valuationResult.getValuationRate());
        bin.setStockValue(valuationResult.getStockValue());
        bin.setStockQueue(serializedQueue);
        bin.setUpdatedAt(ZonedDateTime.now());
        bin.recalculateProjectedQty();

        // Create immutable StockLedgerEntry
        StockLedgerEntry sle = StockLedgerEntry.builder()
                .id("sle-" + UUID.randomUUID().toString().substring(0, 12))
                .itemId(itemId)
                .warehouseId(warehouseId)
                .postingDate(postingDate != null ? postingDate : LocalDate.now())
                .postingTime(postingTime != null ? postingTime : LocalTime.now())
                .voucherType(voucherType)
                .voucherNo(voucherNo)
                .actualQty(actualQtyChange)
                .qtyAfterTransaction(newQty)
                .incomingRate(incomingRate != null ? incomingRate : BigDecimal.ZERO)
                .valuationRate(valuationResult.getValuationRate())
                .stockValue(valuationResult.getStockValue())
                .stockValueDifference(valuationResult.getStockValueDifference())
                .batchId(batchId)
                .serialNos(serialNos)
                .stockQueue(serializedQueue)
                .fiscalYear(String.valueOf(LocalDate.now().getYear()))
                .company("NextGen Corp")
                .remarks(remarks)
                .isCancelled(false)
                .createdAt(ZonedDateTime.now())
                .build();

        return sleRepository.save(sle);
    }

    @Transactional(readOnly = true)
    public List<StockLedgerEntryDto> getStockLedgerEntries() {
        return sleRepository.findLatestEntries().stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<StockLedgerEntryDto> getEntriesByItem(String itemId) {
        return sleRepository.findByItemIdOrderByPostingDateAscPostingTimeAsc(itemId).stream()
                .map(this::mapToDto).toList();
    }

    private StockLedgerEntryDto mapToDto(StockLedgerEntry sle) {
        Item item = itemRepository.findById(sle.getItemId()).orElse(null);
        Warehouse warehouse = warehouseRepository.findById(sle.getWarehouseId()).orElse(null);

        return StockLedgerEntryDto.builder()
                .id(sle.getId())
                .itemId(sle.getItemId())
                .itemCode(item != null ? item.getItemCode() : sle.getItemId())
                .itemName(item != null ? item.getItemName() : "Unknown Item")
                .warehouseId(sle.getWarehouseId())
                .warehouseName(warehouse != null ? warehouse.getWarehouseName() : sle.getWarehouseId())
                .postingDate(sle.getPostingDate())
                .postingTime(sle.getPostingTime())
                .voucherType(sle.getVoucherType())
                .voucherNo(sle.getVoucherNo())
                .actualQty(sle.getActualQty())
                .qtyAfterTransaction(sle.getQtyAfterTransaction())
                .incomingRate(sle.getIncomingRate())
                .valuationRate(sle.getValuationRate())
                .stockValue(sle.getStockValue())
                .stockValueDifference(sle.getStockValueDifference())
                .batchId(sle.getBatchId())
                .serialNos(sle.getSerialNos())
                .isCancelled(sle.getIsCancelled())
                .fiscalYear(sle.getFiscalYear())
                .remarks(sle.getRemarks())
                .createdAt(sle.getCreatedAt())
                .build();
    }
}
