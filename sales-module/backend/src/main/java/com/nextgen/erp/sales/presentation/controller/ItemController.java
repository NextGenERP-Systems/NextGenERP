package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.domain.model.Item;
import com.nextgen.erp.sales.infrastructure.repository.ItemRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/items")
@RequiredArgsConstructor
@Tag(name = "Item Catalog", description = "Endpoints for sales items, prices, and stock UOMs")
public class ItemController {

    private final ItemRepository itemRepository;

    @GetMapping
    @Operation(summary = "Get all sellable catalog items")
    public ResponseEntity<List<Item>> getAllSalesItems() {
        return ResponseEntity.ok(itemRepository.findByIsSalesItemTrue());
    }
}
