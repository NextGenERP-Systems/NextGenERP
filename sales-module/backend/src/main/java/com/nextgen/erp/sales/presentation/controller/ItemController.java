package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.domain.model.*;
import com.nextgen.erp.sales.infrastructure.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Item Catalog & Pricing Masters", description = "Endpoints for Items, Item Groups, Price Lists, Item Prices, and Product Bundles")
public class ItemController {

    private final ItemRepository itemRepository;
    private final ItemGroupRepository itemGroupRepository;
    private final PriceListRepository priceListRepository;
    private final ItemPriceRepository itemPriceRepository;
    private final ProductBundleRepository productBundleRepository;

    // ==========================================
    // 1. ITEMS CRUD
    // ==========================================

    @GetMapping("/api/v1/items")
    @Operation(summary = "Get all catalog items")
    public ResponseEntity<List<Item>> getAllItems(@RequestParam(required = false) String itemGroup) {
        if (itemGroup != null && !itemGroup.isBlank()) {
            return ResponseEntity.ok(itemRepository.findAll().stream()
                    .filter(i -> itemGroup.equalsIgnoreCase(i.getItemGroup()))
                    .toList());
        }
        return ResponseEntity.ok(itemRepository.findAll());
    }

    @GetMapping("/api/v1/items/{id}")
    @Operation(summary = "Get item by ID")
    public ResponseEntity<Item> getItemById(@PathVariable UUID id) {
        return itemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/api/v1/items")
    @Operation(summary = "Create a new catalog item")
    public ResponseEntity<Item> createItem(@RequestBody Item item) {
        if (item.getItemCode() == null || item.getItemCode().isBlank()) {
            item.setItemCode("ITEM-" + System.currentTimeMillis() % 100000);
        }
        Item saved = itemRepository.save(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/api/v1/items/{id}")
    @Operation(summary = "Update item details")
    public ResponseEntity<Item> updateItem(@PathVariable UUID id, @RequestBody Item updated) {
        return itemRepository.findById(id).map(existing -> {
            existing.setItemName(updated.getItemName());
            existing.setItemGroup(updated.getItemGroup());
            existing.setStockUom(updated.getStockUom());
            existing.setIsStockItem(updated.getIsStockItem());
            existing.setIsSalesItem(updated.getIsSalesItem());
            existing.setIsPurchaseItem(updated.getIsPurchaseItem());
            existing.setStandardRate(updated.getStandardRate());
            existing.setValuationRate(updated.getValuationRate());
            existing.setLastPurchaseRate(updated.getLastPurchaseRate());
            existing.setMaxDiscount(updated.getMaxDiscount());
            existing.setHasSerialNo(updated.getHasSerialNo());
            existing.setHasBatchNo(updated.getHasBatchNo());
            existing.setBrand(updated.getBrand());
            existing.setDescription(updated.getDescription());
            existing.setBarcode(updated.getBarcode());
            existing.setDisabled(updated.getDisabled());
            existing.setDefaultWarehouse(updated.getDefaultWarehouse());
            existing.setDefaultIncomeAccount(updated.getDefaultIncomeAccount());
            existing.setDefaultExpenseAccount(updated.getDefaultExpenseAccount());
            return ResponseEntity.ok(itemRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/v1/items/{id}")
    @Operation(summary = "Delete an item")
    public ResponseEntity<Void> deleteItem(@PathVariable UUID id) {
        if (itemRepository.existsById(id)) {
            itemRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ==========================================
    // 2. ITEM GROUPS CRUD
    // ==========================================

    @GetMapping("/api/v1/item-groups")
    @Operation(summary = "Get all item groups")
    public ResponseEntity<List<ItemGroup>> getAllItemGroups() {
        return ResponseEntity.ok(itemGroupRepository.findAll());
    }

    @PostMapping("/api/v1/item-groups")
    @Operation(summary = "Create an item group")
    public ResponseEntity<ItemGroup> createItemGroup(@RequestBody ItemGroup group) {
        ItemGroup saved = itemGroupRepository.save(group);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/api/v1/item-groups/{id}")
    @Operation(summary = "Update an item group")
    public ResponseEntity<ItemGroup> updateItemGroup(@PathVariable UUID id, @RequestBody ItemGroup updated) {
        return itemGroupRepository.findById(id).map(existing -> {
            existing.setItemGroupName(updated.getItemGroupName());
            existing.setParentItemGroup(updated.getParentItemGroup());
            existing.setIsGroup(updated.getIsGroup());
            existing.setDescription(updated.getDescription());
            return ResponseEntity.ok(itemGroupRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/v1/item-groups/{id}")
    @Operation(summary = "Delete an item group")
    public ResponseEntity<Void> deleteItemGroup(@PathVariable UUID id) {
        if (itemGroupRepository.existsById(id)) {
            itemGroupRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ==========================================
    // 3. PRICE LISTS CRUD
    // ==========================================

    @GetMapping("/api/v1/price-lists")
    @Operation(summary = "Get all price lists")
    public ResponseEntity<List<PriceList>> getAllPriceLists() {
        return ResponseEntity.ok(priceListRepository.findAll());
    }

    @PostMapping("/api/v1/price-lists")
    @Operation(summary = "Create a price list")
    public ResponseEntity<PriceList> createPriceList(@RequestBody PriceList priceList) {
        PriceList saved = priceListRepository.save(priceList);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/api/v1/price-lists/{id}")
    @Operation(summary = "Update a price list")
    public ResponseEntity<PriceList> updatePriceList(@PathVariable UUID id, @RequestBody PriceList updated) {
        return priceListRepository.findById(id).map(existing -> {
            existing.setPriceListName(updated.getPriceListName());
            existing.setCurrency(updated.getCurrency());
            existing.setBuying(updated.getBuying());
            existing.setSelling(updated.getSelling());
            existing.setEnabled(updated.getEnabled());
            return ResponseEntity.ok(priceListRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/v1/price-lists/{id}")
    @Operation(summary = "Delete a price list")
    public ResponseEntity<Void> deletePriceList(@PathVariable UUID id) {
        if (priceListRepository.existsById(id)) {
            priceListRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ==========================================
    // 4. ITEM PRICES CRUD
    // ==========================================

    @GetMapping("/api/v1/item-prices")
    @Operation(summary = "Get all item prices")
    public ResponseEntity<List<ItemPrice>> getAllItemPrices() {
        return ResponseEntity.ok(itemPriceRepository.findAll());
    }

    @PostMapping("/api/v1/item-prices")
    @Operation(summary = "Create an item price record")
    public ResponseEntity<ItemPrice> createItemPrice(@RequestBody ItemPrice itemPrice) {
        ItemPrice saved = itemPriceRepository.save(itemPrice);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/api/v1/item-prices/{id}")
    @Operation(summary = "Delete an item price record")
    public ResponseEntity<Void> deleteItemPrice(@PathVariable UUID id) {
        if (itemPriceRepository.existsById(id)) {
            itemPriceRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ==========================================
    // 5. PRODUCT BUNDLES (KITTING) CRUD
    // ==========================================

    @GetMapping("/api/v1/product-bundles")
    @Operation(summary = "Get all product bundles")
    public ResponseEntity<List<ProductBundle>> getAllProductBundles() {
        return ResponseEntity.ok(productBundleRepository.findAll());
    }

    @GetMapping("/api/v1/product-bundles/{id}")
    @Operation(summary = "Get product bundle by ID")
    public ResponseEntity<ProductBundle> getProductBundleById(@PathVariable UUID id) {
        return productBundleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/api/v1/product-bundles")
    @Operation(summary = "Create a product bundle")
    public ResponseEntity<ProductBundle> createProductBundle(@RequestBody ProductBundle bundle) {
        if (bundle.getItems() != null) {
            for (ProductBundleItem item : bundle.getItems()) {
                item.setProductBundle(bundle);
            }
        }
        ProductBundle saved = productBundleRepository.save(bundle);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/api/v1/product-bundles/{id}")
    @Operation(summary = "Delete a product bundle")
    public ResponseEntity<Void> deleteProductBundle(@PathVariable UUID id) {
        if (productBundleRepository.existsById(id)) {
            productBundleRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
