package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.*;
import com.nextgen.erp.sales.domain.model.*;
import com.nextgen.erp.sales.infrastructure.repository.CouponCodeRepository;
import com.nextgen.erp.sales.infrastructure.repository.PricingRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PricingRuleEngine {

    private final PricingRuleRepository pricingRuleRepository;
    private final CouponCodeRepository couponCodeRepository;

    // --- PRICING RULES ---

    @Transactional(readOnly = true)
    public List<PricingRuleDto> getAllPricingRules() {
        return pricingRuleRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toPricingRuleDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PricingRuleDto createPricingRule(PricingRuleCreateRequest request) {
        PricingRule rule = PricingRule.builder()
                .title(request.getTitle())
                .applyOn(request.getApplyOn())
                .applyKeyId(request.getApplyKeyId())
                .minQty(request.getMinQty() != null ? request.getMinQty() : BigDecimal.ONE)
                .discountPercentage(request.getDiscountPercentage() != null ? request.getDiscountPercentage() : BigDecimal.ZERO)
                .discountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO)
                .isFreeItem(request.isFreeItem())
                .freeItemCode(request.getFreeItemCode())
                .freeQty(request.getFreeQty() != null ? request.getFreeQty() : BigDecimal.ZERO)
                .validFrom(request.getValidFrom() != null ? request.getValidFrom() : LocalDate.now())
                .validUpto(request.getValidUpto())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        PricingRule saved = pricingRuleRepository.save(rule);
        log.info("Created Pricing Rule: {} on {}", saved.getTitle(), saved.getApplyKeyId());
        return toPricingRuleDto(saved);
    }

    @Transactional(readOnly = true)
    public Optional<PricingRule> findBestRule(String itemCode, String itemGroup, BigDecimal qty) {
        LocalDate today = LocalDate.now();
        List<PricingRule> rules = pricingRuleRepository.findByActiveTrue();

        return rules.stream()
                .filter(r -> !r.isFreeItem())
                .filter(r -> r.getValidFrom() == null || !r.getValidFrom().isAfter(today))
                .filter(r -> r.getValidUpto() == null || !r.getValidUpto().isBefore(today))
                .filter(r -> r.getMinQty() == null || qty.compareTo(r.getMinQty()) >= 0)
                .filter(r -> (r.getApplyOn() == PricingRuleApplyOn.ITEM_CODE && r.getApplyKeyId().equalsIgnoreCase(itemCode))
                        || (r.getApplyOn() == PricingRuleApplyOn.ITEM_GROUP && itemGroup != null && r.getApplyKeyId().equalsIgnoreCase(itemGroup)))
                .findFirst();
    }

    @Transactional(readOnly = true)
    public Optional<PricingRule> findFreeItemRule(String itemCode, String itemGroup, BigDecimal qty) {
        LocalDate today = LocalDate.now();
        List<PricingRule> rules = pricingRuleRepository.findByActiveTrue();

        return rules.stream()
                .filter(PricingRule::isFreeItem)
                .filter(r -> r.getFreeItemCode() != null && !r.getFreeItemCode().isBlank())
                .filter(r -> r.getFreeQty() != null && r.getFreeQty().compareTo(BigDecimal.ZERO) > 0)
                .filter(r -> r.getValidFrom() == null || !r.getValidFrom().isAfter(today))
                .filter(r -> r.getValidUpto() == null || !r.getValidUpto().isBefore(today))
                .filter(r -> r.getMinQty() == null || qty.compareTo(r.getMinQty()) >= 0)
                .filter(r -> (r.getApplyOn() == PricingRuleApplyOn.ITEM_CODE && r.getApplyKeyId().equalsIgnoreCase(itemCode))
                        || (r.getApplyOn() == PricingRuleApplyOn.ITEM_GROUP && itemGroup != null && r.getApplyKeyId().equalsIgnoreCase(itemGroup)))
                .findFirst();
    }

    // --- COUPON CODES ---

    @Transactional(readOnly = true)
    public List<CouponCodeDto> getAllCoupons() {
        return couponCodeRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toCouponDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CouponCodeDto createCoupon(CouponCodeDto dto) {
        CouponCode coupon = CouponCode.builder()
                .couponName(dto.getCouponName())
                .couponCode(dto.getCouponCode().toUpperCase().trim())
                .discountType(dto.getDiscountType() != null ? dto.getDiscountType() : CouponDiscountType.PERCENTAGE)
                .discountValue(dto.getDiscountValue())
                .minOrderAmount(dto.getMinOrderAmount() != null ? dto.getMinOrderAmount() : BigDecimal.ZERO)
                .validUpto(dto.getValidUpto())
                .maxUses(dto.getMaxUses() > 0 ? dto.getMaxUses() : 100)
                .active(true)
                .build();

        return toCouponDto(couponCodeRepository.save(coupon));
    }

    @Transactional
    public CouponApplyResponse validateAndApplyCoupon(CouponApplyRequest request) {
        String code = request.getCouponCode().toUpperCase().trim();
        Optional<CouponCode> optCoupon = couponCodeRepository.findByCouponCodeAndActiveTrue(code);

        if (optCoupon.isEmpty()) {
            return CouponApplyResponse.builder()
                    .valid(false)
                    .couponCode(code)
                    .calculatedDiscountAmount(BigDecimal.ZERO)
                    .finalAmount(request.getOrderAmount())
                    .message("Invalid or expired coupon code: " + code)
                    .build();
        }

        CouponCode coupon = optCoupon.get();
        LocalDate today = LocalDate.now();

        if (coupon.getValidUpto() != null && coupon.getValidUpto().isBefore(today)) {
            return CouponApplyResponse.builder()
                    .valid(false)
                    .couponCode(code)
                    .calculatedDiscountAmount(BigDecimal.ZERO)
                    .finalAmount(request.getOrderAmount())
                    .message("Coupon has expired on " + coupon.getValidUpto())
                    .build();
        }

        if (coupon.getUsedCount() >= coupon.getMaxUses()) {
            return CouponApplyResponse.builder()
                    .valid(false)
                    .couponCode(code)
                    .calculatedDiscountAmount(BigDecimal.ZERO)
                    .finalAmount(request.getOrderAmount())
                    .message("Coupon usage limit reached (" + coupon.getMaxUses() + " uses).")
                    .build();
        }

        if (request.getOrderAmount().compareTo(coupon.getMinOrderAmount()) < 0) {
            return CouponApplyResponse.builder()
                    .valid(false)
                    .couponCode(code)
                    .calculatedDiscountAmount(BigDecimal.ZERO)
                    .finalAmount(request.getOrderAmount())
                    .message(String.format("Order amount must be at least %s to apply this coupon.", coupon.getMinOrderAmount()))
                    .build();
        }

        BigDecimal discountAmount;
        if (coupon.getDiscountType() == CouponDiscountType.PERCENTAGE) {
            discountAmount = request.getOrderAmount()
                    .multiply(coupon.getDiscountValue())
                    .divide(new BigDecimal("100.00"), 2, RoundingMode.HALF_UP);
        } else {
            discountAmount = coupon.getDiscountValue();
        }

        BigDecimal finalAmount = request.getOrderAmount().subtract(discountAmount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        return CouponApplyResponse.builder()
                .valid(true)
                .couponCode(coupon.getCouponCode())
                .couponName(coupon.getCouponName())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .calculatedDiscountAmount(discountAmount)
                .finalAmount(finalAmount)
                .message("Coupon successfully applied!")
                .build();
    }

    public PricingRuleDto toPricingRuleDto(PricingRule rule) {
        return PricingRuleDto.builder()
                .id(rule.getId())
                .title(rule.getTitle())
                .applyOn(rule.getApplyOn())
                .applyKeyId(rule.getApplyKeyId())
                .minQty(rule.getMinQty())
                .discountPercentage(rule.getDiscountPercentage())
                .discountAmount(rule.getDiscountAmount())
                .isFreeItem(rule.isFreeItem())
                .freeItemCode(rule.getFreeItemCode())
                .freeQty(rule.getFreeQty())
                .validFrom(rule.getValidFrom())
                .validUpto(rule.getValidUpto())
                .active(rule.isActive())
                .createdAt(rule.getCreatedAt())
                .build();
    }

    public CouponCodeDto toCouponDto(CouponCode coupon) {
        return CouponCodeDto.builder()
                .id(coupon.getId())
                .couponName(coupon.getCouponName())
                .couponCode(coupon.getCouponCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .validUpto(coupon.getValidUpto())
                .usedCount(coupon.getUsedCount())
                .maxUses(coupon.getMaxUses())
                .active(coupon.isActive())
                .createdAt(coupon.getCreatedAt())
                .build();
    }
}
