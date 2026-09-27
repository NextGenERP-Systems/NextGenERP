package com.nextgen.erp.stock.application.service;

import com.nextgen.erp.stock.application.dto.LandedCostVoucherCreateRequest;
import com.nextgen.erp.stock.application.dto.LandedCostVoucherDto;
import com.nextgen.erp.stock.domain.model.*;
import com.nextgen.erp.stock.infrastructure.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class LandedCostVoucherService {

    private final LandedCostVoucherRepository voucherRepository;
    private final LandedCostItemRepository itemRepository;
    private final LandedCostTaxRepository taxRepository;
    private final ItemRepository stockItemRepository;

    @Transactional(readOnly = true)
    public List<LandedCostVoucherDto> getAllVouchers() {
        return voucherRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public LandedCostVoucherDto getVoucherById(String id) {
        LandedCostVoucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Landed Cost Voucher not found: " + id));
        return mapToDto(voucher);
    }

    @Transactional
    public LandedCostVoucherDto createAndSubmitVoucher(LandedCostVoucherCreateRequest request) {
        String voucherId = "lcv-" + UUID.randomUUID().toString().substring(0, 8);
        String voucherNumber = "LCV-" + LocalDate.now().getYear() + "-" + String.format("%04d", new Random().nextInt(9000) + 1000);

        // 1. Calculate total charges from taxes
        BigDecimal totalTaxes = request.getTaxes().stream()
                .map(t -> t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Compute item distributions
        String distMethod = request.getDistributeChargesBasedOn() != null ? request.getDistributeChargesBasedOn() : "Amount";
        List<LandedCostItem> items = new ArrayList<>();

        if ("Qty".equalsIgnoreCase(distMethod)) {
            BigDecimal totalQty = request.getItems().stream()
                    .map(i -> i.getQty() != null ? i.getQty() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            for (LandedCostVoucherCreateRequest.ItemRequest reqItem : request.getItems()) {
                BigDecimal itemQty = reqItem.getQty() != null ? reqItem.getQty() : BigDecimal.ZERO;
                BigDecimal itemRate = reqItem.getRate() != null ? reqItem.getRate() : BigDecimal.ZERO;
                BigDecimal itemAmt = reqItem.getAmount() != null ? reqItem.getAmount() : itemQty.multiply(itemRate);

                BigDecimal charges = BigDecimal.ZERO;
                if (totalQty.compareTo(BigDecimal.ZERO) > 0) {
                    charges = totalTaxes.multiply(itemQty).divide(totalQty, 4, RoundingMode.HALF_UP);
                }

                items.add(LandedCostItem.builder()
                        .id("lci-" + UUID.randomUUID().toString().substring(0, 8))
                        .receiptDocumentType(reqItem.getReceiptDocumentType())
                        .receiptDocumentId(reqItem.getReceiptDocumentId())
                        .itemId(reqItem.getItemId())
                        .qty(itemQty)
                        .rate(itemRate)
                        .amount(itemAmt)
                        .applicableCharges(charges)
                        .createdAt(ZonedDateTime.now())
                        .build());
            }
        } else if ("Distribute Manually".equalsIgnoreCase(distMethod)) {
            for (LandedCostVoucherCreateRequest.ItemRequest reqItem : request.getItems()) {
                BigDecimal itemQty = reqItem.getQty() != null ? reqItem.getQty() : BigDecimal.ZERO;
                BigDecimal itemRate = reqItem.getRate() != null ? reqItem.getRate() : BigDecimal.ZERO;
                BigDecimal itemAmt = reqItem.getAmount() != null ? reqItem.getAmount() : itemQty.multiply(itemRate);
                BigDecimal charges = reqItem.getApplicableCharges() != null ? reqItem.getApplicableCharges() : BigDecimal.ZERO;

                items.add(LandedCostItem.builder()
                        .id("lci-" + UUID.randomUUID().toString().substring(0, 8))
                        .receiptDocumentType(reqItem.getReceiptDocumentType())
                        .receiptDocumentId(reqItem.getReceiptDocumentId())
                        .itemId(reqItem.getItemId())
                        .qty(itemQty)
                        .rate(itemRate)
                        .amount(itemAmt)
                        .applicableCharges(charges)
                        .createdAt(ZonedDateTime.now())
                        .build());
            }
        } else {
            // Default: "Amount"
            BigDecimal totalAmount = request.getItems().stream()
                    .map(i -> {
                        BigDecimal q = i.getQty() != null ? i.getQty() : BigDecimal.ZERO;
                        BigDecimal r = i.getRate() != null ? i.getRate() : BigDecimal.ZERO;
                        return i.getAmount() != null ? i.getAmount() : q.multiply(r);
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            for (LandedCostVoucherCreateRequest.ItemRequest reqItem : request.getItems()) {
                BigDecimal itemQty = reqItem.getQty() != null ? reqItem.getQty() : BigDecimal.ZERO;
                BigDecimal itemRate = reqItem.getRate() != null ? reqItem.getRate() : BigDecimal.ZERO;
                BigDecimal itemAmt = reqItem.getAmount() != null ? reqItem.getAmount() : itemQty.multiply(itemRate);

                BigDecimal charges = BigDecimal.ZERO;
                if (totalAmount.compareTo(BigDecimal.ZERO) > 0) {
                    charges = totalTaxes.multiply(itemAmt).divide(totalAmount, 4, RoundingMode.HALF_UP);
                }

                items.add(LandedCostItem.builder()
                        .id("lci-" + UUID.randomUUID().toString().substring(0, 8))
                        .receiptDocumentType(reqItem.getReceiptDocumentType())
                        .receiptDocumentId(reqItem.getReceiptDocumentId())
                        .itemId(reqItem.getItemId())
                        .qty(itemQty)
                        .rate(itemRate)
                        .amount(itemAmt)
                        .applicableCharges(charges)
                        .createdAt(ZonedDateTime.now())
                        .build());
            }
        }

        // 3. Create taxes
        List<LandedCostTax> taxes = request.getTaxes().stream()
                .map(t -> LandedCostTax.builder()
                        .id("lct-" + UUID.randomUUID().toString().substring(0, 8))
                        .expenseAccount(t.getExpenseAccount())
                        .description(t.getDescription())
                        .amount(t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO)
                        .createdAt(ZonedDateTime.now())
                        .build())
                .toList();

        // 4. Create and save voucher
        LandedCostVoucher voucher = LandedCostVoucher.builder()
                .id(voucherId)
                .voucherNumber(voucherNumber)
                .postingDate(request.getPostingDate() != null ? request.getPostingDate() : LocalDate.now())
                .distributeChargesBasedOn(distMethod)
                .totalTaxesAndCharges(totalTaxes)
                .status(StockEntryStatus.SUBMITTED)
                .remarks(request.getRemarks())
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .build();

        for (LandedCostItem it : items) {
            it.setVoucher(voucher);
        }
        for (LandedCostTax tx : taxes) {
            tx.setVoucher(voucher);
        }
        voucher.setItems(items);
        voucher.setTaxes(taxes);

        LandedCostVoucher saved = voucherRepository.save(voucher);
        log.info("Created and submitted Landed Cost Voucher: {} (Total charges: {})", voucherNumber, totalTaxes);

        return mapToDto(saved);
    }

    private LandedCostVoucherDto mapToDto(LandedCostVoucher v) {
        List<LandedCostVoucherDto.LandedCostItemDto> itemDtos = v.getItems().stream()
                .map(item -> {
                    String itemCode = item.getItemId();
                    String itemName = item.getItemId();
                    Optional<Item> itemOpt = stockItemRepository.findById(item.getItemId());
                    if (itemOpt.isPresent()) {
                        itemCode = itemOpt.get().getItemCode();
                        itemName = itemOpt.get().getItemName();
                    }

                    BigDecimal newRate = item.getRate();
                    if (item.getQty() != null && item.getQty().compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal totalCost = (item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO)
                                .add(item.getApplicableCharges() != null ? item.getApplicableCharges() : BigDecimal.ZERO);
                        newRate = totalCost.divide(item.getQty(), 4, RoundingMode.HALF_UP);
                    }

                    return LandedCostVoucherDto.LandedCostItemDto.builder()
                            .id(item.getId())
                            .receiptDocumentType(item.getReceiptDocumentType())
                            .receiptDocumentId(item.getReceiptDocumentId())
                            .itemId(item.getItemId())
                            .itemCode(itemCode)
                            .itemName(itemName)
                            .qty(item.getQty())
                            .rate(item.getRate())
                            .amount(item.getAmount())
                            .applicableCharges(item.getApplicableCharges())
                            .newRate(newRate)
                            .build();
                })
                .toList();

        List<LandedCostVoucherDto.LandedCostTaxDto> taxDtos = v.getTaxes().stream()
                .map(tax -> LandedCostVoucherDto.LandedCostTaxDto.builder()
                        .id(tax.getId())
                        .expenseAccount(tax.getExpenseAccount())
                        .description(tax.getDescription())
                        .amount(tax.getAmount())
                        .build())
                .toList();

        return LandedCostVoucherDto.builder()
                .id(v.getId())
                .voucherNumber(v.getVoucherNumber())
                .postingDate(v.getPostingDate())
                .distributeChargesBasedOn(v.getDistributeChargesBasedOn())
                .totalTaxesAndCharges(v.getTotalTaxesAndCharges())
                .status(v.getStatus() != null ? v.getStatus().name() : "DRAFT")
                .remarks(v.getRemarks())
                .createdAt(v.getCreatedAt())
                .items(itemDtos)
                .taxes(taxDtos)
                .build();
    }
}
