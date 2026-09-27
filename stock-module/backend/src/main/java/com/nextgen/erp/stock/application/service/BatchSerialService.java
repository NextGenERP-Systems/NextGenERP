package com.nextgen.erp.stock.application.service;

import com.nextgen.erp.stock.application.dto.BatchDto;
import com.nextgen.erp.stock.application.dto.QualityInspectionDto;
import com.nextgen.erp.stock.application.dto.SerialNoDto;
import com.nextgen.erp.stock.domain.model.*;
import com.nextgen.erp.stock.infrastructure.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BatchSerialService {

    private final BatchRepository batchRepository;
    private final SerialNoRepository serialNoRepository;
    private final QualityInspectionRepository qualityInspectionRepository;
    private final ItemRepository itemRepository;
    private final WarehouseRepository warehouseRepository;

    @Transactional(readOnly = true)
    public List<BatchDto> getAllBatches() {
        return batchRepository.findAll().stream().map(this::mapBatchToDto).toList();
    }

    @Transactional
    public BatchDto createBatch(BatchDto dto) {
        Batch b = Batch.builder()
                .id("batch-" + UUID.randomUUID().toString().substring(0, 8))
                .batchId(dto.getBatchId())
                .itemId(dto.getItemId())
                .manufacturingDate(dto.getManufacturingDate())
                .expiryDate(dto.getExpiryDate())
                .batchQty(dto.getBatchQty())
                .supplierBatchNo(dto.getSupplierBatchNo())
                .description(dto.getDescription())
                .isDisabled(false)
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .build();
        return mapBatchToDto(batchRepository.save(b));
    }

    @Transactional(readOnly = true)
    public List<SerialNoDto> getAllSerials() {
        return serialNoRepository.findAll().stream().map(this::mapSerialToDto).toList();
    }

    @Transactional
    public SerialNoDto createSerial(SerialNoDto dto) {
        SerialNo sn = SerialNo.builder()
                .id("sn-" + UUID.randomUUID().toString().substring(0, 8))
                .serialNo(dto.getSerialNo())
                .itemId(dto.getItemId())
                .warehouseId(dto.getWarehouseId())
                .batchId(dto.getBatchId())
                .status("Active")
                .purchaseRate(dto.getPurchaseRate())
                .warrantyExpiryDate(dto.getWarrantyExpiryDate())
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .build();
        return mapSerialToDto(serialNoRepository.save(sn));
    }

    @Transactional(readOnly = true)
    public List<QualityInspectionDto> getAllInspections() {
        return qualityInspectionRepository.findAll().stream().map(this::mapQIToDto).toList();
    }

    @Transactional(readOnly = true)
    public QualityInspectionDto getInspectionById(String id) {
        QualityInspection qi = qualityInspectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Quality Inspection not found: " + id));
        return mapQIToDto(qi);
    }

    @Transactional
    public QualityInspectionDto createInspection(QualityInspectionCreateRequest request) {
        String id = "qi-" + UUID.randomUUID().toString().substring(0, 8);
        String number = "QI-" + LocalDate.now().getYear() + "-" + String.format("%04d", new Random().nextInt(9000) + 1000);

        boolean anyRejected = false;
        List<QualityInspectionReading> readings = new ArrayList<>();

        if (request.getReadings() != null) {
            for (QualityInspectionCreateRequest.ReadingRequest rr : request.getReadings()) {
                BigDecimal val = rr.getReadingValue();
                InspectionStatus readingStatus = InspectionStatus.ACCEPTED;
                if (rr.getMinValue() != null && val.compareTo(rr.getMinValue()) < 0) {
                    readingStatus = InspectionStatus.REJECTED;
                    anyRejected = true;
                }
                if (rr.getMaxValue() != null && val.compareTo(rr.getMaxValue()) > 0) {
                    readingStatus = InspectionStatus.REJECTED;
                    anyRejected = true;
                }

                readings.add(QualityInspectionReading.builder()
                        .id("qir-" + UUID.randomUUID().toString().substring(0, 8))
                        .parameterName(rr.getParameterName())
                        .specification(rr.getSpecification())
                        .minValue(rr.getMinValue())
                        .maxValue(rr.getMaxValue())
                        .readingValue(val)
                        .status(readingStatus)
                        .createdAt(ZonedDateTime.now())
                        .build());
            }
        }

        InspectionStatus overallStatus = anyRejected ? InspectionStatus.REJECTED : InspectionStatus.ACCEPTED;

        QualityInspection qi = QualityInspection.builder()
                .id(id)
                .inspectionNumber(number)
                .inspectionType(request.getInspectionType())
                .referenceType(request.getReferenceType())
                .referenceId(request.getReferenceId())
                .itemId(request.getItemId())
                .sampleSize(request.getSampleSize() != null ? request.getSampleSize() : BigDecimal.ONE)
                .inspectionDate(request.getInspectionDate() != null ? request.getInspectionDate() : LocalDate.now())
                .inspector(request.getInspector() != null && !request.getInspector().isBlank() ? request.getInspector() : "QC Specialist")
                .status(overallStatus)
                .remarks(request.getRemarks())
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .build();

        for (QualityInspectionReading r : readings) {
            r.setInspection(qi);
        }
        qi.setReadings(readings);

        QualityInspection saved = qualityInspectionRepository.save(qi);
        return mapQIToDto(saved);
    }

    private BatchDto mapBatchToDto(Batch b) {
        Item item = itemRepository.findById(b.getItemId()).orElse(null);
        return BatchDto.builder()
                .id(b.getId())
                .batchId(b.getBatchId())
                .itemId(b.getItemId())
                .itemCode(item != null ? item.getItemCode() : b.getItemId())
                .itemName(item != null ? item.getItemName() : "Unknown Item")
                .manufacturingDate(b.getManufacturingDate())
                .expiryDate(b.getExpiryDate())
                .batchQty(b.getBatchQty())
                .supplierBatchNo(b.getSupplierBatchNo())
                .description(b.getDescription())
                .isDisabled(b.getIsDisabled())
                .build();
    }

    private SerialNoDto mapSerialToDto(SerialNo sn) {
        Item item = itemRepository.findById(sn.getItemId()).orElse(null);
        Warehouse wh = sn.getWarehouseId() != null ? warehouseRepository.findById(sn.getWarehouseId()).orElse(null) : null;
        return SerialNoDto.builder()
                .id(sn.getId())
                .serialNo(sn.getSerialNo())
                .itemId(sn.getItemId())
                .itemCode(item != null ? item.getItemCode() : sn.getItemId())
                .itemName(item != null ? item.getItemName() : "Unknown Item")
                .warehouseId(sn.getWarehouseId())
                .warehouseName(wh != null ? wh.getWarehouseName() : sn.getWarehouseId())
                .batchId(sn.getBatchId())
                .status(sn.getStatus())
                .purchaseRate(sn.getPurchaseRate())
                .warrantyExpiryDate(sn.getWarrantyExpiryDate())
                .build();
    }

    private QualityInspectionDto mapQIToDto(QualityInspection qi) {
        Item item = itemRepository.findById(qi.getItemId()).orElse(null);

        List<QualityInspectionDto.QualityInspectionReadingDto> readingDtos = null;
        if (qi.getReadings() != null) {
            readingDtos = qi.getReadings().stream()
                    .map(r -> QualityInspectionDto.QualityInspectionReadingDto.builder()
                            .id(r.getId())
                            .parameterName(r.getParameterName())
                            .specification(r.getSpecification())
                            .minValue(r.getMinValue())
                            .maxValue(r.getMaxValue())
                            .readingValue(r.getReadingValue())
                            .status(r.getStatus())
                            .build())
                    .toList();
        }

        return QualityInspectionDto.builder()
                .id(qi.getId())
                .inspectionNumber(qi.getInspectionNumber())
                .inspectionType(qi.getInspectionType())
                .referenceType(qi.getReferenceType())
                .referenceId(qi.getReferenceId())
                .itemId(qi.getItemId())
                .itemCode(item != null ? item.getItemCode() : qi.getItemId())
                .itemName(item != null ? item.getItemName() : "Unknown Item")
                .sampleSize(qi.getSampleSize())
                .inspectionDate(qi.getInspectionDate())
                .inspector(qi.getInspector())
                .status(qi.getStatus())
                .remarks(qi.getRemarks())
                .readings(readingDtos)
                .build();
    }
}
