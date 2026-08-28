package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.*;
import com.nextgen.erp.sales.application.service.PricingRuleEngine;
import com.nextgen.erp.sales.domain.model.PromotionalScheme;
import com.nextgen.erp.sales.domain.model.ShippingRule;
import com.nextgen.erp.sales.infrastructure.repository.PromotionalSchemeRepository;
import com.nextgen.erp.sales.infrastructure.repository.ShippingRuleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Pricing Rules & Promo Hub", description = "Endpoints for volume discounts, free items, coupon codes, promotional schemes, and shipping rules")
public class PricingRuleController {

    private final PricingRuleEngine pricingRuleEngine;
    private final PromotionalSchemeRepository promotionalSchemeRepository;
    private final ShippingRuleRepository shippingRuleRepository;

    // --- PRICING RULES ---

    @GetMapping("/api/v1/pricing-rules")
    @Operation(summary = "Get all active pricing rules")
    public ResponseEntity<List<PricingRuleDto>> getAllPricingRules() {
        return ResponseEntity.ok(pricingRuleEngine.getAllPricingRules());
    }

    @PostMapping("/api/v1/pricing-rules")
    @Operation(summary = "Create a new pricing rule")
    public ResponseEntity<PricingRuleDto> createPricingRule(@Valid @RequestBody PricingRuleCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pricingRuleEngine.createPricingRule(request));
    }

    // --- COUPON CODES ---

    @GetMapping("/api/v1/coupons")
    @Operation(summary = "Get all coupons")
    public ResponseEntity<List<CouponCodeDto>> getAllCoupons() {
        return ResponseEntity.ok(pricingRuleEngine.getAllCoupons());
    }

    @PostMapping("/api/v1/coupons")
    @Operation(summary = "Create a new coupon code")
    public ResponseEntity<CouponCodeDto> createCoupon(@Valid @RequestBody CouponCodeDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pricingRuleEngine.createCoupon(request));
    }

    @PostMapping("/api/v1/coupons/apply")
    @Operation(summary = "Validate and apply a coupon code")
    public ResponseEntity<CouponApplyResponse> applyCoupon(@Valid @RequestBody CouponApplyRequest request) {
        return ResponseEntity.ok(pricingRuleEngine.validateAndApplyCoupon(request));
    }

    // --- PROMOTIONAL SCHEMES ---

    @GetMapping("/api/v1/promotional-schemes")
    @Operation(summary = "Get all promotional schemes")
    public ResponseEntity<List<PromotionalScheme>> getAllPromotionalSchemes() {
        return ResponseEntity.ok(promotionalSchemeRepository.findAll());
    }

    @PostMapping("/api/v1/promotional-schemes")
    @Operation(summary = "Create a new promotional scheme")
    public ResponseEntity<PromotionalScheme> createPromotionalScheme(@RequestBody PromotionalScheme scheme) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promotionalSchemeRepository.save(scheme));
    }

    @DeleteMapping("/api/v1/promotional-schemes/{id}")
    @Operation(summary = "Delete a promotional scheme")
    public ResponseEntity<Void> deletePromotionalScheme(@PathVariable UUID id) {
        if (promotionalSchemeRepository.existsById(id)) {
            promotionalSchemeRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- SHIPPING RULES ---

    @GetMapping("/api/v1/shipping-rules")
    @Operation(summary = "Get all shipping rules")
    public ResponseEntity<List<ShippingRule>> getAllShippingRules() {
        return ResponseEntity.ok(shippingRuleRepository.findAll());
    }

    @PostMapping("/api/v1/shipping-rules")
    @Operation(summary = "Create a new shipping rule")
    public ResponseEntity<ShippingRule> createShippingRule(@RequestBody ShippingRule rule) {
        return ResponseEntity.status(HttpStatus.CREATED).body(shippingRuleRepository.save(rule));
    }

    @DeleteMapping("/api/v1/shipping-rules/{id}")
    @Operation(summary = "Delete a shipping rule")
    public ResponseEntity<Void> deleteShippingRule(@PathVariable UUID id) {
        if (shippingRuleRepository.existsById(id)) {
            shippingRuleRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
