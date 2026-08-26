package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.*;
import com.nextgen.erp.sales.application.service.PricingRuleEngine;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Pricing Rules & Promo Hub", description = "Endpoints for volume discounts, free items, and coupon codes")
public class PricingRuleController {

    private final PricingRuleEngine pricingRuleEngine;

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
}
