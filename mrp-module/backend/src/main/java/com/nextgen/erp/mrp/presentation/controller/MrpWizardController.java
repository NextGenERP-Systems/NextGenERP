package com.nextgen.erp.mrp.presentation.controller;

import com.nextgen.erp.mrp.application.service.MrpWizardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/mrp/wizard")
@RequiredArgsConstructor
@Tag(name = "MRP Planning Wizard", description = "Material Shortage Explosion & Production Plan Calculation")
public class MrpWizardController {

    private final MrpWizardService mrpWizardService;

    @GetMapping("/calculate")
    @Operation(summary = "Explode multi-level BOM and calculate raw material shortages")
    public ResponseEntity<Map<String, Object>> calculateRequirements(
            @RequestParam String bomNo,
            @RequestParam BigDecimal plannedQty,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate planningDate
    ) {
        return ResponseEntity.ok(mrpWizardService.calculateMaterialRequirements(bomNo, plannedQty,
                planningDate == null ? LocalDate.now() : planningDate));
    }
}
