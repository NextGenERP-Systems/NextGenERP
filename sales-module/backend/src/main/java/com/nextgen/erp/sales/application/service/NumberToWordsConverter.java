package com.nextgen.erp.sales.application.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class NumberToWordsConverter {

    private static final String[] UNITS = {
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
            "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    };

    private static final String[] TENS = {
            "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    };

    public static String convert(BigDecimal amount, String currency) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) {
            return "Zero " + (currency != null ? currency : "INR") + " Only";
        }

        BigDecimal scaled = amount.setScale(2, RoundingMode.HALF_UP);
        long wholePart = scaled.longValue();
        long fractionalPart = scaled.remainder(BigDecimal.ONE).multiply(new BigDecimal(100)).longValue();

        String words = convertNumber(wholePart);
        StringBuilder result = new StringBuilder(words).append(" ").append(currency != null ? currency : "INR");

        if (fractionalPart > 0) {
            result.append(" and ").append(convertNumber(fractionalPart)).append(" Cents/Paise");
        }

        result.append(" Only");
        return result.toString().trim();
    }

    private static String convertNumber(long n) {
        if (n < 0) {
            return "Minus " + convertNumber(-n);
        }
        if (n < 20) {
            return UNITS[(int) n];
        }
        if (n < 100) {
            return TENS[(int) n / 10] + ((n % 10 != 0) ? " " + UNITS[(int) n % 10] : "");
        }
        if (n < 1000) {
            return UNITS[(int) n / 100] + " Hundred" + ((n % 100 != 0) ? " " + convertNumber(n % 100) : "");
        }
        if (n < 100000) {
            return convertNumber(n / 1000) + " Thousand" + ((n % 1000 != 0) ? " " + convertNumber(n % 1000) : "");
        }
        if (n < 10000000) {
            return convertNumber(n / 100000) + " Lakh" + ((n % 100000 != 0) ? " " + convertNumber(n % 100000) : "");
        }
        return convertNumber(n / 10000000) + " Crore" + ((n % 10000000 != 0) ? " " + convertNumber(n % 10000000) : "");
    }
}
