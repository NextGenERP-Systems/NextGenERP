package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.*;
import com.nextgen.erp.sales.domain.exception.BusinessValidationException;
import com.nextgen.erp.sales.domain.exception.ResourceNotFoundException;
import com.nextgen.erp.sales.domain.model.Customer;
import com.nextgen.erp.sales.domain.model.MaintenanceContract;
import com.nextgen.erp.sales.domain.model.MaintenanceContractItem;
import com.nextgen.erp.sales.domain.model.MaintenanceVisit;
import com.nextgen.erp.sales.domain.model.MaintenanceVisitItem;
import com.nextgen.erp.sales.domain.model.WarrantyClaim;
import com.nextgen.erp.sales.infrastructure.repository.CustomerRepository;
import com.nextgen.erp.sales.infrastructure.repository.MaintenanceContractRepository;
import com.nextgen.erp.sales.infrastructure.repository.MaintenanceVisitRepository;
import com.nextgen.erp.sales.infrastructure.repository.WarrantyClaimRepository;
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
public class MaintenanceService {

    private final MaintenanceContractRepository contractRepository;
    private final MaintenanceVisitRepository visitRepository;
    private final WarrantyClaimRepository warrantyClaimRepository;
    private final CustomerRepository customerRepository;

    // ==================== CONTRACTS ====================

    @Transactional(readOnly = true)
    public List<MaintenanceContractDto> getAllContracts() {
        return contractRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapContractToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MaintenanceContractDto> getContractsByCustomer(UUID customerId) {
        return contractRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapContractToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MaintenanceContractDto getContractById(UUID id) {
        MaintenanceContract contract = contractRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceContract", id));
        return mapContractToDto(contract);
    }

    @Transactional
    public MaintenanceContractDto createContract(MaintenanceContractCreateRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));

        String contractNumber = "MC-" + LocalDate.now().getYear() + "-" + String.format("%04d", (int)(Math.random() * 9000 + 1000));

        MaintenanceContract contract = MaintenanceContract.builder()
                .contractNumber(contractNumber)
                .customerId(customer.getId())
                .customerName(customer.getCustomerName())
                .contractType(request.getContractType() != null ? request.getContractType() : "AMC")
                .status(MaintenanceContract.ContractStatus.DRAFT)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .termsAndConditions(request.getTermsAndConditions())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (MaintenanceContractCreateRequest.ContractItemRequest itemReq : request.getItems()) {
            BigDecimal rate = itemReq.getRate() != null ? itemReq.getRate() : BigDecimal.ZERO;
            MaintenanceContractItem item = MaintenanceContractItem.builder()
                    .itemId(itemReq.getItemId())
                    .itemCode(itemReq.getItemCode())
                    .itemName(itemReq.getItemName())
                    .serialNo(itemReq.getSerialNo())
                    .startDate(itemReq.getStartDate() != null ? itemReq.getStartDate() : request.getStartDate())
                    .endDate(itemReq.getEndDate() != null ? itemReq.getEndDate() : request.getEndDate())
                    .periodicity(itemReq.getPeriodicity() != null ? itemReq.getPeriodicity() : "QUARTERLY")
                    .noOfVisits(itemReq.getNoOfVisits() != null ? itemReq.getNoOfVisits() : 4)
                    .rate(rate)
                    .amount(rate)
                    .build();

            contract.addItem(item);
            totalAmount = totalAmount.add(rate);
        }

        contract.setTotalAmount(totalAmount);
        MaintenanceContract saved = contractRepository.save(contract);
        log.info("Created Maintenance Contract {} for customer {}", saved.getContractNumber(), saved.getCustomerName());
        return mapContractToDto(saved);
    }

    @Transactional
    public MaintenanceContractDto activateContract(UUID id) {
        MaintenanceContract contract = contractRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceContract", id));

        if (contract.getStatus() == MaintenanceContract.ContractStatus.CANCELLED) {
            throw new BusinessValidationException("Cannot activate a cancelled Maintenance Contract");
        }

        contract.setStatus(MaintenanceContract.ContractStatus.ACTIVE);
        contract.setUpdatedAt(OffsetDateTime.now());
        MaintenanceContract updated = contractRepository.save(contract);
        log.info("Activated Maintenance Contract {}", updated.getContractNumber());
        return mapContractToDto(updated);
    }

    @Transactional
    public MaintenanceContractDto cancelContract(UUID id) {
        MaintenanceContract contract = contractRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceContract", id));

        contract.setStatus(MaintenanceContract.ContractStatus.CANCELLED);
        contract.setUpdatedAt(OffsetDateTime.now());
        MaintenanceContract updated = contractRepository.save(contract);
        log.info("Cancelled Maintenance Contract {}", updated.getContractNumber());
        return mapContractToDto(updated);
    }

    // ==================== VISITS ====================

    @Transactional(readOnly = true)
    public List<MaintenanceVisitDto> getAllVisits() {
        return visitRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapVisitToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MaintenanceVisitDto> getVisitsByCustomer(UUID customerId) {
        return visitRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapVisitToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MaintenanceVisitDto> getVisitsByContract(UUID contractId) {
        return visitRepository.findByMaintenanceContractIdOrderByCreatedAtDesc(contractId).stream()
                .map(this::mapVisitToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MaintenanceVisitDto getVisitById(UUID id) {
        MaintenanceVisit visit = visitRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceVisit", id));
        return mapVisitToDto(visit);
    }

    @Transactional
    public MaintenanceVisitDto createVisit(MaintenanceVisitCreateRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));

        String visitNumber = "MV-" + LocalDate.now().getYear() + "-" + String.format("%04d", (int)(Math.random() * 9000 + 1000));

        MaintenanceVisit visit = MaintenanceVisit.builder()
                .visitNumber(visitNumber)
                .customerId(customer.getId())
                .customerName(customer.getCustomerName())
                .maintenanceContractId(request.getMaintenanceContractId())
                .maintenanceType(request.getMaintenanceType() != null ? request.getMaintenanceType() : MaintenanceVisit.MaintenanceType.PREVENTIVE_MAINTENANCE)
                .visitDate(request.getVisitDate())
                .servicePerson(request.getServicePerson())
                .status(MaintenanceVisit.VisitStatus.SCHEDULED)
                .customerFeedback(request.getCustomerFeedback())
                .completionNotes(request.getCompletionNotes())
                .build();

        for (MaintenanceVisitCreateRequest.VisitItemRequest itemReq : request.getItems()) {
            MaintenanceVisitItem item = MaintenanceVisitItem.builder()
                    .itemCode(itemReq.getItemCode())
                    .itemName(itemReq.getItemName())
                    .serialNo(itemReq.getSerialNo())
                    .workDone(itemReq.getWorkDone())
                    .actionTaken(itemReq.getActionTaken())
                    .partsReplaced(itemReq.getPartsReplaced())
                    .build();
            visit.addItem(item);
        }

        MaintenanceVisit saved = visitRepository.save(visit);
        log.info("Scheduled Maintenance Visit {} for customer {}", saved.getVisitNumber(), saved.getCustomerName());
        return mapVisitToDto(saved);
    }

    @Transactional
    public MaintenanceVisitDto startVisit(UUID id) {
        MaintenanceVisit visit = visitRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceVisit", id));

        if (visit.getStatus() == MaintenanceVisit.VisitStatus.CANCELLED || visit.getStatus() == MaintenanceVisit.VisitStatus.COMPLETED) {
            throw new BusinessValidationException("Cannot start a cancelled or completed visit");
        }

        visit.setStatus(MaintenanceVisit.VisitStatus.IN_PROGRESS);
        visit.setUpdatedAt(OffsetDateTime.now());
        MaintenanceVisit updated = visitRepository.save(visit);
        return mapVisitToDto(updated);
    }

    @Transactional
    public MaintenanceVisitDto completeVisit(UUID id, String feedback, String completionNotes) {
        MaintenanceVisit visit = visitRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceVisit", id));

        if (visit.getStatus() == MaintenanceVisit.VisitStatus.CANCELLED) {
            throw new BusinessValidationException("Cannot complete a cancelled visit");
        }

        visit.setStatus(MaintenanceVisit.VisitStatus.COMPLETED);
        if (feedback != null && !feedback.isBlank()) {
            visit.setCustomerFeedback(feedback);
        }
        if (completionNotes != null && !completionNotes.isBlank()) {
            visit.setCompletionNotes(completionNotes);
        }
        visit.setUpdatedAt(OffsetDateTime.now());
        MaintenanceVisit updated = visitRepository.save(visit);
        log.info("Completed Maintenance Visit {}", updated.getVisitNumber());
        return mapVisitToDto(updated);
    }

    @Transactional
    public MaintenanceVisitDto cancelVisit(UUID id) {
        MaintenanceVisit visit = visitRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceVisit", id));

        visit.setStatus(MaintenanceVisit.VisitStatus.CANCELLED);
        visit.setUpdatedAt(OffsetDateTime.now());
        MaintenanceVisit updated = visitRepository.save(visit);
        return mapVisitToDto(updated);
    }

    // ==================== WARRANTY CLAIMS ====================

    @Transactional(readOnly = true)
    public List<WarrantyClaimDto> getAllClaims() {
        return warrantyClaimRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapClaimToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WarrantyClaimDto> getClaimsByCustomer(UUID customerId) {
        return warrantyClaimRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapClaimToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WarrantyClaimDto getClaimById(UUID id) {
        WarrantyClaim claim = warrantyClaimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", id));
        return mapClaimToDto(claim);
    }

    @Transactional
    public WarrantyClaimDto createClaim(WarrantyClaimCreateRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));

        String claimNumber = "WC-" + LocalDate.now().getYear() + "-" + String.format("%04d", (int)(Math.random() * 9000 + 1000));

        WarrantyClaim claim = WarrantyClaim.builder()
                .claimNumber(claimNumber)
                .customerId(customer.getId())
                .customerName(customer.getCustomerName())
                .itemCode(request.getItemCode())
                .itemName(request.getItemName())
                .serialNo(request.getSerialNo())
                .complaintDescription(request.getComplaintDescription())
                .status(WarrantyClaim.ClaimStatus.OPEN)
                .resolutionType(request.getResolutionType() != null ? request.getResolutionType() : "REPAIR")
                .reportedDate(LocalDate.now())
                .build();

        WarrantyClaim saved = warrantyClaimRepository.save(claim);
        log.info("Logged Warranty Claim {} for item {} ({})", saved.getClaimNumber(), saved.getItemCode(), saved.getCustomerName());
        return mapClaimToDto(saved);
    }

    @Transactional
    public WarrantyClaimDto resolveClaim(UUID id, String resolutionType, String resolutionNotes) {
        WarrantyClaim claim = warrantyClaimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", id));

        claim.setStatus(WarrantyClaim.ClaimStatus.RESOLVED);
        if (resolutionType != null && !resolutionType.isBlank()) {
            claim.setResolutionType(resolutionType);
        }
        claim.setResolutionNotes(resolutionNotes);
        claim.setResolvedDate(LocalDate.now());
        claim.setUpdatedAt(OffsetDateTime.now());
        WarrantyClaim updated = warrantyClaimRepository.save(claim);
        log.info("Resolved Warranty Claim {}", updated.getClaimNumber());
        return mapClaimToDto(updated);
    }

    @Transactional
    public WarrantyClaimDto closeClaim(UUID id) {
        WarrantyClaim claim = warrantyClaimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", id));

        claim.setStatus(WarrantyClaim.ClaimStatus.CLOSED);
        claim.setUpdatedAt(OffsetDateTime.now());
        WarrantyClaim updated = warrantyClaimRepository.save(claim);
        return mapClaimToDto(updated);
    }

    // ==================== MAPPERS ====================

    private MaintenanceContractDto mapContractToDto(MaintenanceContract c) {
        List<MaintenanceContractDto.ContractItemDto> items = c.getItems() != null
                ? c.getItems().stream().map(i -> MaintenanceContractDto.ContractItemDto.builder()
                .id(i.getId())
                .itemId(i.getItemId())
                .itemCode(i.getItemCode())
                .itemName(i.getItemName())
                .serialNo(i.getSerialNo())
                .startDate(i.getStartDate())
                .endDate(i.getEndDate())
                .periodicity(i.getPeriodicity())
                .noOfVisits(i.getNoOfVisits())
                .rate(i.getRate())
                .amount(i.getAmount())
                .build()).collect(Collectors.toList())
                : List.of();

        return MaintenanceContractDto.builder()
                .id(c.getId())
                .contractNumber(c.getContractNumber())
                .customerId(c.getCustomerId())
                .customerName(c.getCustomerName())
                .contractType(c.getContractType())
                .status(c.getStatus())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .totalAmount(c.getTotalAmount())
                .invoicedAmount(c.getInvoicedAmount())
                .termsAndConditions(c.getTermsAndConditions())
                .items(items)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private MaintenanceVisitDto mapVisitToDto(MaintenanceVisit v) {
        List<MaintenanceVisitDto.VisitItemDto> items = v.getItems() != null
                ? v.getItems().stream().map(i -> MaintenanceVisitDto.VisitItemDto.builder()
                .id(i.getId())
                .itemCode(i.getItemCode())
                .itemName(i.getItemName())
                .serialNo(i.getSerialNo())
                .workDone(i.getWorkDone())
                .actionTaken(i.getActionTaken())
                .partsReplaced(i.getPartsReplaced())
                .build()).collect(Collectors.toList())
                : List.of();

        return MaintenanceVisitDto.builder()
                .id(v.getId())
                .visitNumber(v.getVisitNumber())
                .customerId(v.getCustomerId())
                .customerName(v.getCustomerName())
                .maintenanceContractId(v.getMaintenanceContractId())
                .maintenanceType(v.getMaintenanceType())
                .visitDate(v.getVisitDate())
                .servicePerson(v.getServicePerson())
                .status(v.getStatus())
                .customerFeedback(v.getCustomerFeedback())
                .completionNotes(v.getCompletionNotes())
                .items(items)
                .createdAt(v.getCreatedAt())
                .updatedAt(v.getUpdatedAt())
                .build();
    }

    private WarrantyClaimDto mapClaimToDto(WarrantyClaim c) {
        return WarrantyClaimDto.builder()
                .id(c.getId())
                .claimNumber(c.getClaimNumber())
                .customerId(c.getCustomerId())
                .customerName(c.getCustomerName())
                .itemCode(c.getItemCode())
                .itemName(c.getItemName())
                .serialNo(c.getSerialNo())
                .complaintDescription(c.getComplaintDescription())
                .status(c.getStatus())
                .resolutionType(c.getResolutionType())
                .resolutionNotes(c.getResolutionNotes())
                .reportedDate(c.getReportedDate())
                .resolvedDate(c.getResolvedDate())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
