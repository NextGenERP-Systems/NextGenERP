package com.nextgen.erp.stock.presentation;

import com.nextgen.erp.stock.application.dto.*;
import com.nextgen.erp.stock.application.service.*;
import com.nextgen.erp.stock.domain.model.StockReconciliation;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stock")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Stock & Inventory Management", description = "Enterprise Real-time Stock Ledger, Bins, Valuation, Serial & Batch APIs")
public class StockController {

    private final ItemService itemService;
    private final WarehouseService warehouseService;
    private final BinService binService;
    private final StockLedgerService stockLedgerService;
    private final StockEntryService stockEntryService;
    private final BatchSerialService batchSerialService;
    private final StockReconciliationService stockReconciliationService;
    private final DashboardMetricsService dashboardMetricsService;
    private final LandedCostVoucherService landedCostVoucherService;

    // --- Dashboard Metrics ---
    @GetMapping("/metrics")
    @Operation(summary = "Get Real-time Inventory Metrics & Warehouse Breakdowns")
    public ResponseEntity<StockSummaryMetricsDto> getMetrics() {
        return ResponseEntity.ok(dashboardMetricsService.getDashboardMetrics());
    }

    // --- Items ---
    @GetMapping("/items")
    @Operation(summary = "List all stock items")
    public ResponseEntity<List<ItemDto>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    @GetMapping("/items/{id}")
    @Operation(summary = "Get item by ID")
    public ResponseEntity<ItemDto> getItemById(@PathVariable String id) {
        return ResponseEntity.ok(itemService.getItemById(id));
    }

    @PostMapping("/items")
    @Operation(summary = "Create a new item")
    public ResponseEntity<ItemDto> createItem(@Valid @RequestBody ItemDto dto) {
        return new ResponseEntity<>(itemService.createItem(dto), HttpStatus.CREATED);
    }

    // --- Warehouses ---
    @GetMapping("/warehouses")
    @Operation(summary = "List all warehouses")
    public ResponseEntity<List<WarehouseDto>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @PostMapping("/warehouses")
    @Operation(summary = "Create a new warehouse")
    public ResponseEntity<WarehouseDto> createWarehouse(@Valid @RequestBody WarehouseDto dto) {
        return new ResponseEntity<>(warehouseService.createWarehouse(dto), HttpStatus.CREATED);
    }

    // --- Bins (Real-time balances) ---
    @GetMapping("/bins")
    @Operation(summary = "List real-time Bins (Item + Warehouse balances)")
    public ResponseEntity<List<BinDto>> getAllBins(
            @RequestParam(required = false) String warehouseId,
            @RequestParam(required = false) String itemId
    ) {
        if (warehouseId != null) {
            return ResponseEntity.ok(binService.getBinsByWarehouse(warehouseId));
        }
        if (itemId != null) {
            return ResponseEntity.ok(binService.getBinsByItem(itemId));
        }
        return ResponseEntity.ok(binService.getAllBins());
    }

    // --- Stock Ledger (Immutable Double-Entry Log) ---
    @GetMapping("/ledger")
    @Operation(summary = "Get immutable Stock Ledger Entries")
    public ResponseEntity<List<StockLedgerEntryDto>> getStockLedgerEntries(
            @RequestParam(required = false) String itemId
    ) {
        if (itemId != null) {
            return ResponseEntity.ok(stockLedgerService.getEntriesByItem(itemId));
        }
        return ResponseEntity.ok(stockLedgerService.getStockLedgerEntries());
    }

    // --- Stock Entries (Receipt, Issue, Transfer, Manufacture, Repack) ---
    @GetMapping("/entries")
    @Operation(summary = "List all Stock Entries")
    public ResponseEntity<List<StockEntryDto>> getAllStockEntries() {
        return ResponseEntity.ok(stockEntryService.getAllEntries());
    }

    @GetMapping("/entries/{id}")
    @Operation(summary = "Get Stock Entry by ID")
    public ResponseEntity<StockEntryDto> getStockEntryById(@PathVariable String id) {
        return ResponseEntity.ok(stockEntryService.getEntryById(id));
    }

    @PostMapping("/entries")
    @Operation(summary = "Create & Submit a new Stock Entry (Receipt, Issue, Transfer, Manufacture, Repack)")
    public ResponseEntity<StockEntryDto> createStockEntry(@Valid @RequestBody StockEntryCreateRequest request) {
        return new ResponseEntity<>(stockEntryService.createAndSubmitEntry(request), HttpStatus.CREATED);
    }

    // --- Stock Reconciliation (Physical Count Adjustment & Audits) ---
    @GetMapping("/reconcile")
    @Operation(summary = "List all physical inventory reconciliation audit entries")
    public ResponseEntity<List<StockReconciliationDto>> getAllReconciliations() {
        return ResponseEntity.ok(stockReconciliationService.getAllReconciliations());
    }

    @GetMapping("/reconcile/{id}")
    @Operation(summary = "Get stock reconciliation by ID with discrepancy lines")
    public ResponseEntity<StockReconciliationDto> getReconciliationById(@PathVariable String id) {
        return ResponseEntity.ok(stockReconciliationService.getReconciliationById(id));
    }

    @PostMapping("/reconcile")
    @Operation(summary = "Submit Physical Inventory Reconciliation Adjustment")
    public ResponseEntity<StockReconciliationDto> reconcileStock(@Valid @RequestBody StockReconciliationCreateRequest request) {
        return new ResponseEntity<>(stockReconciliationService.reconcileStock(request), HttpStatus.CREATED);
    }

    // --- Batches & Serial Numbers ---
    @GetMapping("/batches")
    @Operation(summary = "List all inventory batches")
    public ResponseEntity<List<BatchDto>> getAllBatches() {
        return ResponseEntity.ok(batchSerialService.getAllBatches());
    }

    @PostMapping("/batches")
    @Operation(summary = "Create a new batch")
    public ResponseEntity<BatchDto> createBatch(@Valid @RequestBody BatchDto dto) {
        return new ResponseEntity<>(batchSerialService.createBatch(dto), HttpStatus.CREATED);
    }

    @GetMapping("/serials")
    @Operation(summary = "List all serial numbers")
    public ResponseEntity<List<SerialNoDto>> getAllSerials() {
        return ResponseEntity.ok(batchSerialService.getAllSerials());
    }

    @PostMapping("/serials")
    @Operation(summary = "Register a new serial number")
    public ResponseEntity<SerialNoDto> createSerial(@Valid @RequestBody SerialNoDto dto) {
        return new ResponseEntity<>(batchSerialService.createSerial(dto), HttpStatus.CREATED);
    }

    // --- Quality Inspections ---
    @GetMapping("/inspections")
    @Operation(summary = "List quality inspections")
    public ResponseEntity<List<QualityInspectionDto>> getAllInspections() {
        return ResponseEntity.ok(batchSerialService.getAllInspections());
    }

    @GetMapping("/inspections/{id}")
    @Operation(summary = "Get quality inspection by ID with parameter readings")
    public ResponseEntity<QualityInspectionDto> getInspectionById(@PathVariable String id) {
        return ResponseEntity.ok(batchSerialService.getInspectionById(id));
    }

    @PostMapping("/inspections")
    @Operation(summary = "Record quality inspection with parameter readings and automated tolerance verification")
    public ResponseEntity<QualityInspectionDto> createInspection(@Valid @RequestBody QualityInspectionCreateRequest request) {
        return new ResponseEntity<>(batchSerialService.createInspection(request), HttpStatus.CREATED);
    }

    // --- Landed Cost Vouchers (Cost Absorption Engine) ---
    @GetMapping("/landed-cost")
    @Operation(summary = "List all Landed Cost Vouchers")
    public ResponseEntity<List<LandedCostVoucherDto>> getAllLandedCostVouchers() {
        return ResponseEntity.ok(landedCostVoucherService.getAllVouchers());
    }

    @GetMapping("/landed-cost/{id}")
    @Operation(summary = "Get Landed Cost Voucher by ID")
    public ResponseEntity<LandedCostVoucherDto> getLandedCostVoucherById(@PathVariable String id) {
        return ResponseEntity.ok(landedCostVoucherService.getVoucherById(id));
    }

    @PostMapping("/landed-cost")
    @Operation(summary = "Create and submit a Landed Cost Voucher to allocate freight, duties and charges")
    public ResponseEntity<LandedCostVoucherDto> createLandedCostVoucher(@Valid @RequestBody LandedCostVoucherCreateRequest request) {
        return new ResponseEntity<>(landedCostVoucherService.createAndSubmitVoucher(request), HttpStatus.CREATED);
    }
}
