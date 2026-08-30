package com.nextgen.erp.accounting.presentation.controller;

import com.nextgen.erp.accounting.application.service.AssetService;
import com.nextgen.erp.accounting.domain.model.Asset;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assets")
@RequiredArgsConstructor
@Tag(name = "Fixed Asset Management", description = "Endpoints for asset register, net book value, and automated depreciation")
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    @Operation(summary = "Get all Fixed Assets")
    public ResponseEntity<List<Asset>> getAllAssets() {
        return ResponseEntity.ok(assetService.getAllAssets());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Asset by UUID")
    public ResponseEntity<Asset> getAssetById(@PathVariable UUID id) {
        return assetService.getAssetById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Register a new Fixed Asset")
    public ResponseEntity<Asset> createAsset(@RequestBody Asset asset) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createAsset(asset));
    }

    @PostMapping("/{id}/depreciate")
    @Operation(summary = "Run monthly depreciation calculation and post GL adjustment")
    public ResponseEntity<Asset> runDepreciation(@PathVariable UUID id) {
        return ResponseEntity.ok(assetService.runDepreciation(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Asset by UUID")
    public ResponseEntity<Void> deleteAsset(@PathVariable UUID id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }
}
