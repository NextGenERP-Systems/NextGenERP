package com.nextgen.erp.mrp.presentation.controller;

import com.nextgen.erp.mrp.application.service.ScrapService;
import com.nextgen.erp.mrp.domain.entity.ScrapItem;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mrp/scrap")
@RequiredArgsConstructor
@Tag(name = "Material Scrap Tracking", description = "Material Scrap & Waste Logging APIs")
public class ScrapController {

    private final ScrapService scrapService;

    @GetMapping
    @Operation(summary = "Get all material scrap logs")
    public ResponseEntity<List<ScrapItem>> getAllScrapItems() {
        return ResponseEntity.ok(scrapService.getAllScrapItems());
    }

    @GetMapping("/work-order/{workOrderId}")
    @Operation(summary = "Get material scrap logged for a Work Order")
    public ResponseEntity<List<ScrapItem>> getScrapByWorkOrder(@PathVariable String workOrderId) {
        return ResponseEntity.ok(scrapService.getScrapByWorkOrder(workOrderId));
    }

    @PostMapping
    @Operation(summary = "Log a new material scrap entry")
    public ResponseEntity<ScrapItem> logScrapItem(@RequestBody ScrapItem scrapItem) {
        return ResponseEntity.ok(scrapService.logScrapItem(scrapItem));
    }
}
