package com.nextgen.erp.sales.domain.engine;

import com.nextgen.erp.sales.domain.model.DiscountApplyOn;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class PricingEngine {

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");

    public record ItemPricingResult(
            BigDecimal rate,
            BigDecimal baseRate,
            BigDecimal amount,
            BigDecimal baseAmount,
            BigDecimal netRate,
            BigDecimal netAmount,
            BigDecimal baseNetAmount,
            BigDecimal stockQty,
            BigDecimal grossProfit
    ) {}

    public ItemPricingResult calculateItemPricing(
            BigDecimal qty,
            BigDecimal conversionFactor,
            BigDecimal priceListRate,
            BigDecimal discountPercentage,
            BigDecimal discountAmount,
            BigDecimal conversionRate,
            BigDecimal valuationRate
    ) {
        if (qty == null) qty = BigDecimal.ONE;
        if (conversionFactor == null || conversionFactor.compareTo(BigDecimal.ZERO) == 0) conversionFactor = BigDecimal.ONE;
        if (priceListRate == null) priceListRate = BigDecimal.ZERO;
        if (discountPercentage == null) discountPercentage = BigDecimal.ZERO;
        if (discountAmount == null) discountAmount = BigDecimal.ZERO;
        if (conversionRate == null || conversionRate.compareTo(BigDecimal.ZERO) == 0) conversionRate = BigDecimal.ONE;
        if (valuationRate == null) valuationRate = BigDecimal.ZERO;

        BigDecimal stockQty = qty.multiply(conversionFactor).setScale(4, RoundingMode.HALF_UP);

        // Rate = Price List Rate * (1 - Discount% / 100) - Discount Amount
        BigDecimal rate = priceListRate;
        if (discountPercentage.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discountVal = priceListRate.multiply(discountPercentage).divide(ONE_HUNDRED, 4, RoundingMode.HALF_UP);
            rate = rate.subtract(discountVal);
        }
        rate = rate.subtract(discountAmount).setScale(2, RoundingMode.HALF_UP);
        if (rate.compareTo(BigDecimal.ZERO) < 0) rate = BigDecimal.ZERO;

        BigDecimal amount = qty.multiply(rate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal netRate = rate;
        BigDecimal netAmount = amount;

        BigDecimal baseRate = rate.multiply(conversionRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal baseAmount = amount.multiply(conversionRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal baseNetAmount = netAmount.multiply(conversionRate).setScale(2, RoundingMode.HALF_UP);

        // Gross profit = (netRate - valuationRate) * stockQty
        BigDecimal grossProfit = netRate.subtract(valuationRate).multiply(stockQty).setScale(2, RoundingMode.HALF_UP);

        return new ItemPricingResult(
                rate,
                baseRate,
                amount,
                baseAmount,
                netRate,
                netAmount,
                baseNetAmount,
                stockQty,
                grossProfit
        );
    }

    public record DocumentTotalsResult(
            BigDecimal netTotal,
            BigDecimal baseNetTotal,
            BigDecimal totalDiscount,
            BigDecimal grandTotal,
            BigDecimal baseGrandTotal
    ) {}

    public DocumentTotalsResult calculateDocumentTotals(
            BigDecimal netTotal,
            BigDecimal totalTaxes,
            BigDecimal additionalDiscountPercentage,
            BigDecimal additionalDiscountAmount,
            DiscountApplyOn applyDiscountOn,
            BigDecimal conversionRate
    ) {
        if (netTotal == null) netTotal = BigDecimal.ZERO;
        if (totalTaxes == null) totalTaxes = BigDecimal.ZERO;
        if (additionalDiscountPercentage == null) additionalDiscountPercentage = BigDecimal.ZERO;
        if (additionalDiscountAmount == null) additionalDiscountAmount = BigDecimal.ZERO;
        if (conversionRate == null || conversionRate.compareTo(BigDecimal.ZERO) == 0) conversionRate = BigDecimal.ONE;

        BigDecimal initialGrandTotal = netTotal.add(totalTaxes);
        BigDecimal discount = BigDecimal.ZERO;

        if (additionalDiscountPercentage.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal baseForDiscount = (applyDiscountOn == DiscountApplyOn.NET_TOTAL) ? netTotal : initialGrandTotal;
            discount = baseForDiscount.multiply(additionalDiscountPercentage).divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
        } else if (additionalDiscountAmount.compareTo(BigDecimal.ZERO) > 0) {
            discount = additionalDiscountAmount;
        }

        BigDecimal grandTotal = initialGrandTotal.subtract(discount).setScale(2, RoundingMode.HALF_UP);
        if (grandTotal.compareTo(BigDecimal.ZERO) < 0) grandTotal = BigDecimal.ZERO;

        BigDecimal baseNetTotal = netTotal.multiply(conversionRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal baseGrandTotal = grandTotal.multiply(conversionRate).setScale(2, RoundingMode.HALF_UP);

        return new DocumentTotalsResult(
                netTotal.setScale(2, RoundingMode.HALF_UP),
                baseNetTotal,
                discount.setScale(2, RoundingMode.HALF_UP),
                grandTotal,
                baseGrandTotal
        );
    }
}
