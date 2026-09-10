package com.nextgen.erp.stock.application.service;

import com.nextgen.erp.stock.application.dto.StockEntryCreateRequest;
import com.nextgen.erp.stock.application.dto.StockEntryDto;
import com.nextgen.erp.stock.domain.model.*;
import com.nextgen.erp.stock.infrastructure.repository.ItemRepository;
import com.nextgen.erp.stock.infrastructure.repository.StockEntryRepository;
import com.nextgen.erp.stock.infrastructure.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockEntryService {

    private final StockEntryRepository stockEntryRepository;
    private final StockLedgerService stockLedgerService;
    private final ItemRepository itemRepository;
    private final WarehouseRepository warehouseRepository;

    @Transactional
    public StockEntryDto createAndSubmitEntry(StockEntryCreateRequest request) {
        String entryId = "se-" + UUID.randomUUID().toString().substring(0, 10);
        String entryNumber = generateEntryNumber(request.getPurpose());
        LocalDate postingDate = request.getPostingDate() != null ? request.getPostingDate() : LocalDate.now();
        LocalTime postingTime = request.getPostingTime() != null ? request.getPostingTime() : LocalTime.now();

        StockEntry entry = StockEntry.builder()
                .id(entryId)
                .entryNumber(entryNumber)
                .purpose(request.getPurpose())
                .postingDate(postingDate)
                .postingTime(postingTime)
                .fromWarehouseId(request.getFromWarehouseId())
                .toWarehouseId(request.getToWarehouseId())
                .additionalCosts(request.getAdditionalCosts() != null ? request.getAdditionalCosts() : BigDecimal.ZERO)
                .workOrderId(request.getWorkOrderId())
                .bomId(request.getBomId())
                .status(StockEntryStatus.SUBMITTED)
                .remarks(request.getRemarks())
                .createdBy("admin")
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .items(new ArrayList<>())
                .build();

        BigDecimal totalIncoming = BigDecimal.ZERO;
        BigDecimal totalOutgoing = BigDecimal.ZERO;

        for (StockEntryCreateRequest.StockEntryItemRequest itemReq : request.getItems()) {
            Item item = itemRepository.findById(itemReq.getItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemReq.getItemId()));

            String srcWh = itemReq.getSourceWarehouseId() != null ? itemReq.getSourceWarehouseId() : request.getFromWarehouseId();
            String tgtWh = itemReq.getTargetWarehouseId() != null ? itemReq.getTargetWarehouseId() : request.getToWarehouseId();

            BigDecimal qty = itemReq.getQty();
            BigDecimal basicRate = itemReq.getBasicRate() != null ? itemReq.getBasicRate() : item.getStandardRate();
            BigDecimal amount = qty.multiply(basicRate);

            StockEntryItem entryItem = StockEntryItem.builder()
                    .id("sei-" + UUID.randomUUID().toString().substring(0, 10))
                    .stockEntry(entry)
                    .itemId(item.getId())
                    .sourceWarehouseId(srcWh)
                    .targetWarehouseId(tgtWh)
                    .qty(qty)
                    .uomId(itemReq.getUomId() != null ? itemReq.getUomId() : item.getStockUom())
                    .basicRate(basicRate)
                    .amount(amount)
                    .additionalCost(itemReq.getAdditionalCost() != null ? itemReq.getAdditionalCost() : BigDecimal.ZERO)
                    .valuationRate(basicRate)
                    .batchId(itemReq.getBatchId())
                    .serialNos(itemReq.getSerialNos())
                    .isScrapItem(itemReq.getIsScrapItem() != null && itemReq.getIsScrapItem())
                    .createdAt(ZonedDateTime.now())
                    .build();

            entry.getItems().add(entryItem);

            // Execute Stock Ledger updates based on Purpose
            switch (request.getPurpose()) {
                case MATERIAL_RECEIPT -> {
                    stockLedgerService.postEntry(
                            item.getId(), tgtWh, postingDate, postingTime,
                            "Stock Entry", entryNumber, qty, basicRate,
                            itemReq.getBatchId(), itemReq.getSerialNos(), "Material Receipt Inward"
                    );
                    totalIncoming = totalIncoming.add(amount);
                }
                case MATERIAL_ISSUE -> {
                    stockLedgerService.postEntry(
                            item.getId(), srcWh, postingDate, postingTime,
                            "Stock Entry", entryNumber, qty.negate(), basicRate,
                            itemReq.getBatchId(), itemReq.getSerialNos(), "Material Issue Outward"
                    );
                    totalOutgoing = totalOutgoing.add(amount);
                }
                case MATERIAL_TRANSFER, MATERIAL_TRANSFER_FOR_MANUFACTURE, MANUFACTURE, REPACK, SEND_TO_SUBCONTRACTOR -> {
                    if (srcWh != null) {
                        stockLedgerService.postEntry(
                                item.getId(), srcWh, postingDate, postingTime,
                                "Stock Entry", entryNumber, qty.negate(), basicRate,
                                itemReq.getBatchId(), itemReq.getSerialNos(), "Transfer Outward from " + srcWh
                        );
                        totalOutgoing = totalOutgoing.add(amount);
                    }
                    if (tgtWh != null) {
                        stockLedgerService.postEntry(
                                item.getId(), tgtWh, postingDate, postingTime,
                                "Stock Entry", entryNumber, qty, basicRate,
                                itemReq.getBatchId(), itemReq.getSerialNos(), "Transfer Inward to " + tgtWh
                        );
                        totalIncoming = totalIncoming.add(amount);
                    }
                }
            }
        }

        entry.setTotalIncomingValue(totalIncoming);
        entry.setTotalOutgoingValue(totalOutgoing);
        entry.setValueDifference(totalIncoming.subtract(totalOutgoing));

        StockEntry saved = stockEntryRepository.save(entry);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<StockEntryDto> getAllEntries() {
        return stockEntryRepository.findAll().stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public StockEntryDto getEntryById(String id) {
        return stockEntryRepository.findById(id).map(this::mapToDto)
                .orElseThrow(() -> new IllegalArgumentException("Stock Entry not found: " + id));
    }

    private String generateEntryNumber(StockEntryPurpose purpose) {
        String prefix = switch (purpose) {
            case MATERIAL_RECEIPT -> "MAT-REC-";
            case MATERIAL_ISSUE -> "MAT-ISS-";
            case MATERIAL_TRANSFER, MATERIAL_TRANSFER_FOR_MANUFACTURE -> "MAT-TRF-";
            case MANUFACTURE -> "MFG-";
            case REPACK -> "RPK-";
            case SEND_TO_SUBCONTRACTOR -> "SUBCON-";
        };
        return prefix + (System.currentTimeMillis() % 1000000);
    }

    private StockEntryDto mapToDto(StockEntry se) {
        Warehouse fromWh = se.getFromWarehouseId() != null ? warehouseRepository.findById(se.getFromWarehouseId()).orElse(null) : null;
        Warehouse toWh = se.getToWarehouseId() != null ? warehouseRepository.findById(se.getToWarehouseId()).orElse(null) : null;

        List<StockEntryDto.StockEntryItemResponse> itemResponses = se.getItems().stream().map(item -> {
            Item it = itemRepository.findById(item.getItemId()).orElse(null);
            Warehouse sWh = item.getSourceWarehouseId() != null ? warehouseRepository.findById(item.getSourceWarehouseId()).orElse(null) : null;
            Warehouse tWh = item.getTargetWarehouseId() != null ? warehouseRepository.findById(item.getTargetWarehouseId()).orElse(null) : null;

            return StockEntryDto.StockEntryItemResponse.builder()
                    .id(item.getId())
                    .itemId(item.getItemId())
                    .itemCode(it != null ? it.getItemCode() : item.getItemId())
                    .itemName(it != null ? it.getItemName() : "Unknown Item")
                    .sourceWarehouseId(item.getSourceWarehouseId())
                    .sourceWarehouseName(sWh != null ? sWh.getWarehouseName() : item.getSourceWarehouseId())
                    .targetWarehouseId(item.getTargetWarehouseId())
                    .targetWarehouseName(tWh != null ? tWh.getWarehouseName() : item.getTargetWarehouseId())
                    .qty(item.getQty())
                    .uomId(item.getUomId())
                    .basicRate(item.getBasicRate())
                    .amount(item.getAmount())
                    .additionalCost(item.getAdditionalCost())
                    .valuationRate(item.getValuationRate())
                    .batchId(item.getBatchId())
                    .serialNos(item.getSerialNos())
                    .isScrapItem(item.getIsScrapItem())
                    .build();
        }).toList();

        return StockEntryDto.builder()
                .id(se.getId())
                .entryNumber(se.getEntryNumber())
                .purpose(se.getPurpose())
                .postingDate(se.getPostingDate())
                .postingTime(se.getPostingTime())
                .fromWarehouseId(se.getFromWarehouseId())
                .fromWarehouseName(fromWh != null ? fromWh.getWarehouseName() : se.getFromWarehouseId())
                .toWarehouseId(se.getToWarehouseId())
                .toWarehouseName(toWh != null ? toWh.getWarehouseName() : se.getToWarehouseId())
                .totalIncomingValue(se.getTotalIncomingValue())
                .totalOutgoingValue(se.getTotalOutgoingValue())
                .valueDifference(se.getValueDifference())
                .additionalCosts(se.getAdditionalCosts())
                .workOrderId(se.getWorkOrderId())
                .bomId(se.getBomId())
                .status(se.getStatus())
                .remarks(se.getRemarks())
                .createdBy(se.getCreatedBy())
                .createdAt(se.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
