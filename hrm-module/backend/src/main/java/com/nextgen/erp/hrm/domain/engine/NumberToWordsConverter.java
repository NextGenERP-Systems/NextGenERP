package com.nextgen.erp.hrm.domain.engine;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class NumberToWordsConverter {

    private static final String[] units = {
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    };

    private static final String[] tens = {
        "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    };

    public String convertToWords(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) {
            return "INR Zero Only";
        }

        long rupees = amount.longValue();
        int paise = amount.remainder(BigDecimal.ONE).multiply(BigDecimal.valueOf(100)).intValue();

        StringBuilder words = new StringBuilder("INR ");
        words.append(convertNumber(rupees));

        if (paise > 0) {
            words.append(" and ").append(convertNumber(paise)).append(" Paise");
        }

        words.append(" Only");
        return words.toString();
    }

    private String convertNumber(long n) {
        if (n == 0) return "Zero";
        if (n < 0) return "Minus " + convertNumber(-n);

        StringBuilder result = new StringBuilder();

        if ((n / 10000000) > 0) {
            result.append(convertNumber(n / 10000000)).append(" Crore ");
            n %= 10000000;
        }

        if ((n / 100000) > 0) {
            result.append(convertNumber(n / 100000)).append(" Lakh ");
            n %= 100000;
        }

        if ((n / 1000) > 0) {
            result.append(convertNumber(n / 1000)).append(" Thousand ");
            n %= 1000;
        }

        if ((n / 100) > 0) {
            result.append(convertNumber(n / 100)).append(" Hundred ");
            n %= 100;
        }

        if (n > 0) {
            if (n < 20) {
                result.append(units[(int) n]);
            } else {
                result.append(tens[(int) (n / 10)]);
                if ((n % 10) > 0) {
                    result.append(" ").append(units[(int) (n % 10)]);
                }
            }
        }

        return result.toString().trim();
    }
}
