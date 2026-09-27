package com.nextgen.erp.stock.application.service;

import com.nextgen.erp.stock.application.dto.StockReconciliationCreateRequest;
import com.nextgen.erp.stock.application.dto.StockReconciliationDto;
import com.nextgen.erp.stock.domain.model.*;
import com.nextgen.erp.stock.infrastructure.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockReconciliationService {

    private final StockReconciliationRepository reconciliationRepository;
    private final StockReconciliationItemRepository itemRepository;
    private final BinRepository binRepository;
    private final ItemRepository stockItemRepository;
    private final WarehouseRepository warehouseRepository;
    private final StockLedgerService stockLedgerService;

    @Transactional(readOnly = true)
    public List<StockReconciliationDto> getAllReconciliations() {
        return reconciliationRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public StockReconciliationDto getReconciliationById(String id) {
        StockReconciliation rec = reconciliationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stock Reconciliation not found: " + id));
        return mapToDto(rec);
    }

    @Transactional
    public StockReconciliationDto reconcileStock(StockReconciliationCreateRequest request) {
        String recId = "rec-" + UUID.randomUUID().toString().substring(0, 10);
        String recNum = "REC-AUDIT-" + (System.currentTimeMillis() % 1000000);
        LocalDate pDate = request.getPostingDate() != null ? request.getPostingDate() : LocalDate.now();
        LocalTime pTime = request.getPostingTime() != null ? request.getPostingTime() : LocalTime.now();

        BigDecimal totalDiffAmount = BigDecimal.ZERO;
        List<StockReconciliationItem> items = new ArrayList<>();

        for (StockReconciliationCreateRequest.ReconciliationItemRequest itemReq : request.getItems()) {
            Bin bin = binRepository.findByItemIdAndWarehouseId(itemReq.getItemId(), itemReq.getWarehouseId())
                    .orElse(null);

            BigDecimal currentQty = (bin != null && bin.getActualQty() != null) ? bin.getActualQty() : BigDecimal.ZERO;
            BigDecimal currentRate = (bin != null && bin.getValuationRate() != null) ? bin.getValuationRate() : BigDecimal.ZERO;
            BigDecimal currentStockVal = currentQty.multiply(currentRate);

            BigDecimal physicalQty = itemReq.getQty();
            BigDecimal diffQty = physicalQty.subtract(currentQty);
            BigDecimal targetRate = itemReq.getValuationRate() != null ? itemReq.getValuationRate() : currentRate;

            BigDecimal targetStockVal = physicalQty.multiply(targetRate);
            BigDecimal itemDiffAmount = targetStockVal.subtract(currentStockVal);

            if (diffQty.compareTo(BigDecimal.ZERO) != 0 || targetRate.compareTo(currentRate) != 0) {
                stockLedgerService.postEntry(
                        itemReq.getItemId(),
                        itemReq.getWarehouseId(),
                        pDate,
                        pTime,
                        "Stock Reconciliation",
                        recNum,
                        diffQty,
                        targetRate,
                        itemReq.getBatchId(),
                        itemReq.getSerialNos(),
                        "Physical Stock Audit Adjustment"
                );
                totalDiffAmount = totalDiffAmount.add(itemDiffAmount);
            }

            items.add(StockReconciliationItem.builder()
                    .id("rci-" + UUID.randomUUID().toString().substring(0, 8))
                    .itemId(itemReq.getItemId())
                    .warehouseId(itemReq.getWarehouseId())
                    .currentQty(currentQty)
                    .currentValuationRate(currentRate)
                    .currentStockValue(currentStockVal)
                    .qty(physicalQty)
                    .valuationRate(targetRate)
                    .amountDifference(itemDiffAmount)
                    .batchId(itemReq.getBatchId())
                    .serialNos(itemReq.getSerialNos())
                    .createdAt(ZonedDateTime.now())
                    .build());
        }

        StockReconciliation rec = StockReconciliation.builder()
                .id(recId)
                .reconciliationNumber(recNum)
                .postingDate(pDate)
                .postingTime(pTime)
                .purpose(request.getPurpose() != null ? request.getPurpose() : "Stock Reconciliation")
                .status(StockEntryStatus.SUBMITTED)
                .differenceAmount(totalDiffAmount)
                .expenseAccount(request.getExpenseAccount() != null ? request.getExpenseAccount() : "Stock Adjustment - NC")
                .remarks(request.getRemarks())
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .build();

        for (StockReconciliationItem it : items) {
            it.setReconciliation(rec);
        }
        rec.setItems(items);

        StockReconciliation saved = reconciliationRepository.save(rec);
        log.info("Posted stock reconciliation: {} with difference amount: {}", recNum, totalDiffAmount);

        return mapToDto(saved);
    }

    private StockReconciliationDto mapToDto(StockReconciliation r) {
        List<StockReconciliationDto.ReconciliationItemDto> itemDtos = r.getItems().stream()
                .map(it -> {
                    String itemCode = it.getItemId();
                    String itemName = it.getItemId();
                    Optional<Item> itemOpt = stockItemRepository.findById(it.getItemId());
                    if (itemOpt.isPresent()) {
                        itemCode = itemOpt.get().getItemCode();
                        itemName = itemOpt.get().getItemName();
                    }

                    String whName = it.getWarehouseId();
                    Optional<Warehouse> whOpt = warehouseRepository.findById(it.getWarehouseId());
                    if (whOpt.isPresent()) {
                        whName = whOpt.get().getWarehouseName();
                    }

                    BigDecimal diffQty = (it.getQty() != null ? it.getQty() : BigDecimal.ZERO)
                            .subtract(it.getCurrentQty() != null ? it.getCurrentQty() : BigDecimal.ZERO);

                    return StockReconciliationDto.ReconciliationItemDto.builder()
                            .id(it.getId())
                            .itemId(it.getItemId())
                            .itemCode(itemCode)
                            .itemName(itemName)
                            .warehouseId(it.getWarehouseId())
                            .warehouseName(whName)
                            .currentQty(it.getCurrentQty())
                            .currentValuationRate(it.getCurrentValuationRate())
                            .currentStockValue(it.getCurrentStockValue())
                            .physicalQty(it.getQty())
                            .valuationRate(it.getValuationRate())
                            .diffQty(diffQty)
                            .amountDifference(it.getAmountDifference())
                            .batchId(it.getBatchId())
                            .serialNos(it.getSerialNos())
                            .build();
                })
                .toList();

        return StockReconciliationDto.builder()
                .id(r.getId())
                .reconciliationNumber(r.getReconciliationNumber())
                .postingDate(r.getPostingDate())
                .postingTime(r.getPostingTime())
                .purpose(r.getPurpose())
                .status(r.getStatus() != null ? r.getStatus().name() : "DRAFT")
                .differenceAmount(r.getDifferenceAmount())
                .expenseAccount(r.getExpenseAccount())
                .remarks(r.getRemarks())
                .createdAt(r.getCreatedAt())
                .items(itemDtos)
                .build();
    }
}
