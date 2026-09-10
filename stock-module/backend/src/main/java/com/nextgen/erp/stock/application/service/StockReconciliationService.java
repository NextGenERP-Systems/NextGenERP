package com.nextgen.erp.stock.application.service;

import com.nextgen.erp.stock.application.dto.StockReconciliationCreateRequest;
import com.nextgen.erp.stock.domain.model.*;
import com.nextgen.erp.stock.infrastructure.repository.BinRepository;
import com.nextgen.erp.stock.infrastructure.repository.StockReconciliationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StockReconciliationService {

    private final StockReconciliationRepository reconciliationRepository;
    private final BinRepository binRepository;
    private final StockLedgerService stockLedgerService;

    @Transactional
    public StockReconciliation reconcileStock(StockReconciliationCreateRequest request) {
        String recId = "rec-" + UUID.randomUUID().toString().substring(0, 10);
        String recNum = "REC-AUDIT-" + (System.currentTimeMillis() % 1000000);
        LocalDate pDate = request.getPostingDate() != null ? request.getPostingDate() : LocalDate.now();
        LocalTime pTime = request.getPostingTime() != null ? request.getPostingTime() : LocalTime.now();

        BigDecimal totalDiffAmount = BigDecimal.ZERO;

        for (StockReconciliationCreateRequest.ReconciliationItemRequest itemReq : request.getItems()) {
            Bin bin = binRepository.findByItemIdAndWarehouseId(itemReq.getItemId(), itemReq.getWarehouseId())
                    .orElse(null);

            BigDecimal currentQty = (bin != null && bin.getActualQty() != null) ? bin.getActualQty() : BigDecimal.ZERO;
            BigDecimal physicalQty = itemReq.getQty();
            BigDecimal diffQty = physicalQty.subtract(currentQty);

            if (diffQty.compareTo(BigDecimal.ZERO) != 0) {
                BigDecimal valRate = itemReq.getValuationRate() != null ? itemReq.getValuationRate() : (bin != null ? bin.getValuationRate() : BigDecimal.ZERO);
                stockLedgerService.postEntry(
                        itemReq.getItemId(),
                        itemReq.getWarehouseId(),
                        pDate,
                        pTime,
                        "Stock Reconciliation",
                        recNum,
                        diffQty,
                        valRate,
                        null,
                        null,
                        "Physical Stock Audit Adjustment"
                );
                totalDiffAmount = totalDiffAmount.add(diffQty.multiply(valRate));
            }
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

        return reconciliationRepository.save(rec);
    }
}
