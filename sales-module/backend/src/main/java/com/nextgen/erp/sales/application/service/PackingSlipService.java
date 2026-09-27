package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.PackingSlipCreateRequest;
import com.nextgen.erp.sales.application.dto.PackingSlipDto;
import com.nextgen.erp.sales.domain.exception.BusinessValidationException;
import com.nextgen.erp.sales.domain.exception.ResourceNotFoundException;
import com.nextgen.erp.sales.domain.model.DeliveryNote;
import com.nextgen.erp.sales.domain.model.PackingSlip;
import com.nextgen.erp.sales.domain.model.PackingSlipItem;
import com.nextgen.erp.sales.domain.model.PackingSlipStatus;
import com.nextgen.erp.sales.infrastructure.repository.DeliveryNoteRepository;
import com.nextgen.erp.sales.infrastructure.repository.PackingSlipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PackingSlipService {

    private final PackingSlipRepository packingSlipRepository;
    private final DeliveryNoteRepository deliveryNoteRepository;

    @Transactional(readOnly = true)
    public List<PackingSlipDto> getAllPackingSlips() {
        return packingSlipRepository.findAllWithItems().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PackingSlipDto> getPackingSlipsByDeliveryNote(UUID deliveryNoteId) {
        return packingSlipRepository.findByDeliveryNoteIdOrderByCreatedAtDesc(deliveryNoteId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PackingSlipDto getPackingSlipById(UUID id) {
        PackingSlip ps = packingSlipRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("PackingSlip", id));
        return mapToDto(ps);
    }

    @Transactional
    public PackingSlipDto createPackingSlip(PackingSlipCreateRequest request) {
        DeliveryNote dn = deliveryNoteRepository.findById(request.getDeliveryNoteId())
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryNote", request.getDeliveryNoteId()));

        if (request.getFromPackageNo() == null || request.getFromPackageNo() < 1) {
            request.setFromPackageNo(1);
        }
        if (request.getToPackageNo() == null || request.getToPackageNo() < request.getFromPackageNo()) {
            request.setToPackageNo(request.getFromPackageNo());
        }

        long existingCount = packingSlipRepository.countByDeliveryNoteId(dn.getId());
        String packingSlipNumber = String.format("PS-%d-%04d", LocalDate.now().getYear(), (existingCount + 1));

        // Auto-calculate weights if empty
        BigDecimal calculatedNetWeight = BigDecimal.ZERO;
        for (PackingSlipCreateRequest.PackingSlipItemRequest it : request.getItems()) {
            if (it.getNetWeight() != null) {
                calculatedNetWeight = calculatedNetWeight.add(it.getNetWeight());
            }
        }

        BigDecimal netWeightPkg = request.getNetWeightPkg() != null && request.getNetWeightPkg().compareTo(BigDecimal.ZERO) > 0
                ? request.getNetWeightPkg()
                : calculatedNetWeight;

        BigDecimal grossWeightPkg = request.getGrossWeightPkg() != null && request.getGrossWeightPkg().compareTo(BigDecimal.ZERO) > 0
                ? request.getGrossWeightPkg()
                : netWeightPkg.multiply(new BigDecimal("1.10")); // 10% tare package allowance

        PackingSlip ps = PackingSlip.builder()
                .packingSlipNumber(packingSlipNumber)
                .deliveryNoteId(dn.getId())
                .deliveryNoteNumber(dn.getDeliveryNoteNumber())
                .fromPackageNo(request.getFromPackageNo())
                .toPackageNo(request.getToPackageNo())
                .packageType(request.getPackageType() != null ? request.getPackageType() : "Carton")
                .netWeightPkg(netWeightPkg)
                .grossWeightPkg(grossWeightPkg)
                .weightUom(request.getWeightUom() != null ? request.getWeightUom() : "Kg")
                .letterOfCredit(request.getLetterOfCredit())
                .shippingMark(request.getShippingMark())
                .status(PackingSlipStatus.PACKED)
                .notes(request.getNotes())
                .build();

        for (PackingSlipCreateRequest.PackingSlipItemRequest itemReq : request.getItems()) {
            PackingSlipItem item = PackingSlipItem.builder()
                    .deliveryNoteItemId(itemReq.getDeliveryNoteItemId())
                    .itemCode(itemReq.getItemCode())
                    .itemName(itemReq.getItemName())
                    .qty(itemReq.getQty() != null ? itemReq.getQty() : BigDecimal.ONE)
                    .netWeight(itemReq.getNetWeight() != null ? itemReq.getNetWeight() : BigDecimal.ZERO)
                    .weightUom(itemReq.getWeightUom() != null ? itemReq.getWeightUom() : "Kg")
                    .productBundleItemCode(itemReq.getProductBundleItemCode())
                    .build();
            ps.addItem(item);
        }

        PackingSlip saved = packingSlipRepository.save(ps);
        log.info("Created Packing Slip {} against Delivery Note {}", saved.getPackingSlipNumber(), dn.getDeliveryNoteNumber());
        return mapToDto(saved);
    }

    @Transactional
    public PackingSlipDto markPackingSlipShipped(UUID id) {
        PackingSlip ps = packingSlipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PackingSlip", id));
        ps.setStatus(PackingSlipStatus.SHIPPED);
        ps.setUpdatedAt(OffsetDateTime.now());
        PackingSlip saved = packingSlipRepository.save(ps);
        log.info("Packing Slip {} marked as SHIPPED", saved.getPackingSlipNumber());
        return mapToDto(saved);
    }

    @Transactional
    public void deletePackingSlip(UUID id) {
        PackingSlip ps = packingSlipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PackingSlip", id));
        if (ps.getStatus() == PackingSlipStatus.SHIPPED) {
            throw new BusinessValidationException("Cannot delete a Packing Slip that has already been shipped.");
        }
        packingSlipRepository.delete(ps);
        log.info("Deleted Packing Slip {}", ps.getPackingSlipNumber());
    }

    private PackingSlipDto mapToDto(PackingSlip ps) {
        int totalPackages = (ps.getToPackageNo() != null && ps.getFromPackageNo() != null)
                ? (ps.getToPackageNo() - ps.getFromPackageNo() + 1)
                : 1;

        List<PackingSlipDto.PackingSlipItemDto> items = ps.getItems() != null
                ? ps.getItems().stream().map(i -> PackingSlipDto.PackingSlipItemDto.builder()
                .id(i.getId())
                .deliveryNoteItemId(i.getDeliveryNoteItemId())
                .itemCode(i.getItemCode())
                .itemName(i.getItemName())
                .qty(i.getQty())
                .netWeight(i.getNetWeight())
                .weightUom(i.getWeightUom())
                .productBundleItemCode(i.getProductBundleItemCode())
                .build()).collect(Collectors.toList())
                : List.of();

        return PackingSlipDto.builder()
                .id(ps.getId())
                .packingSlipNumber(ps.getPackingSlipNumber())
                .deliveryNoteId(ps.getDeliveryNoteId())
                .deliveryNoteNumber(ps.getDeliveryNoteNumber())
                .fromPackageNo(ps.getFromPackageNo())
                .toPackageNo(ps.getToPackageNo())
                .totalPackages(totalPackages)
                .packageType(ps.getPackageType())
                .netWeightPkg(ps.getNetWeightPkg())
                .grossWeightPkg(ps.getGrossWeightPkg())
                .weightUom(ps.getWeightUom())
                .letterOfCredit(ps.getLetterOfCredit())
                .shippingMark(ps.getShippingMark())
                .status(ps.getStatus())
                .notes(ps.getNotes())
                .items(items)
                .createdAt(ps.getCreatedAt())
                .updatedAt(ps.getUpdatedAt())
                .build();
    }
}
