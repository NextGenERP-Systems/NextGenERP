package com.nextgen.erp.mrp.presentation.controller;

import com.nextgen.erp.mrp.application.service.BomService;
import com.nextgen.erp.mrp.domain.entity.Bom;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/mrp/boms")
@RequiredArgsConstructor
@Tag(name = "BOM Management", description = "Bill of Materials APIs with Postgres Recursive CTE Explosion")
public class BomController {

    private final BomService bomService;

    @GetMapping
    @Operation(summary = "List all Bill of Materials")
    public ResponseEntity<List<Bom>> getAllBoms() {
        return ResponseEntity.ok(bomService.getAllBoms());
    }

    @GetMapping("/{bomNo}")
    @Operation(summary = "Get BOM header and items by BOM No")
    public ResponseEntity<Bom> getBomByNo(@PathVariable String bomNo) {
        return ResponseEntity.ok(bomService.getBomByNo(bomNo));
    }

    @GetMapping("/{bomNo}/explode")
    @Operation(summary = "Explode Multi-Level BOM using PostgreSQL Recursive CTE")
    public ResponseEntity<List<Map<String, Object>>> explodeBom(@PathVariable String bomNo) {
        return ResponseEntity.ok(bomService.explodeBomViaCte(bomNo));
    }
}
